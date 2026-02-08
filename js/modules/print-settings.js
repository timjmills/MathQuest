import { state } from './state.js';
import { DOMAINS, SKILLS } from './data.js';
import { randInt, shuffle } from './utils.js';

export function openSimplePrintDialog(skills) {
    // Create simple print modal if it doesn't exist
    let modal = document.getElementById('simplePrintModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'simplePrintModal';
        modal.className = 'modal-overlay';
        modal.style.cssText = 'display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.6);z-index:10000;display:flex;align-items:center;justify-content:center;';
        modal.innerHTML = `
            <div style="background:var(--bg-card);border-radius:16px;max-width:500px;width:90%;max-height:90vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,0.3);">
                <div style="padding:20px;background:linear-gradient(135deg, var(--accent-green), var(--accent-cyan));border-radius:16px 16px 0 0;color:white;">
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <h3 style="margin:0;font-size:1.3rem;">🖨️ Print Worksheet</h3>
                        <button onclick="closeSimplePrintModal()" style="background:rgba(255,255,255,0.2);border:none;color:white;font-size:1.5rem;width:36px;height:36px;border-radius:50%;cursor:pointer;">×</button>
                    </div>
                </div>
                <div style="padding:20px;">
                    <div id="simplePrintSkillsList" style="margin-bottom:15px;padding:12px;background:var(--bg-card-light);border-radius:10px;max-height:100px;overflow-y:auto;"></div>
                    
                    <div style="margin-bottom:12px;">
                        <label style="display:block;font-weight:600;margin-bottom:6px;color:var(--text-dim);font-size:0.9rem;">📝 Worksheet Title (Optional)</label>
                        <input type="text" id="simplePrintTitle" placeholder="e.g., Math Practice" style="width:100%;padding:10px;border:2px solid var(--bg-card-light);border-radius:8px;background:var(--bg-card);color:var(--text-bright);font-size:1rem;">
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                        <div>
                            <label style="display:block;font-weight:600;margin-bottom:6px;color:var(--text-dim);font-size:0.9rem;">🔢 Problems</label>
                            <select id="simplePrintCount" class="dropdown" style="width:100%;padding:10px;">
                                <option value="10">10</option>
                                <option value="20" selected>20</option>
                                <option value="30">30</option>
                                <option value="40">40</option>
                                <option value="50">50</option>
                                <option value="60">60</option>
                                <option value="80">80</option>
                                <option value="100">100</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block;font-weight:600;margin-bottom:6px;color:var(--text-dim);font-size:0.9rem;">📄 Sets</label>
                            <select id="simplePrintSets" class="dropdown" style="width:100%;padding:10px;">
                                <option value="1" selected>1 Set</option>
                                <option value="5">5 Sets</option>
                                <option value="10">10 Sets</option>
                                <option value="20">20 Sets</option>
                            </select>
                        </div>
                    </div>
                    
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
                        <div>
                            <label style="display:block;font-weight:600;margin-bottom:6px;color:var(--text-dim);font-size:0.9rem;">📐 Columns</label>
                            <select id="simplePrintColumns" class="dropdown" style="width:100%;padding:10px;">
                                <option value="1">1 Column</option>
                                <option value="2" selected>2 Columns</option>
                                <option value="3">3 Columns</option>
                                <option value="4">4 Columns (Facts)</option>
                                <option value="5">5 Columns (Facts)</option>
                                <option value="6">6 Columns (Facts)</option>
                                <option value="8">8 Columns (Facts)</option>
                                <option value="10">10 Columns (Fast Facts)</option>
                            </select>
                        </div>
                        <div>
                            <label style="display:block;font-weight:600;margin-bottom:6px;color:var(--text-dim);font-size:0.9rem;">🎨 Style</label>
                            <select id="simplePrintStyle" class="dropdown" style="width:100%;padding:10px;">
                                <option value="color" selected>Color</option>
                                <option value="greyscale">Greyscale</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Answer Key Options -->
                    <div style="margin-bottom:15px;padding:12px;background:var(--bg-card-light);border-radius:10px;">
                        <label style="display:block;font-weight:600;margin-bottom:8px;color:var(--text-dim);font-size:0.9rem;">📋 Answer Key Options</label>
                        <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
                            <input type="checkbox" id="simplePrintAnswerKey" checked style="width:18px;height:18px;">
                            <label for="simplePrintAnswerKey" style="font-size:0.9rem;color:var(--text);">Include Answer Key</label>
                        </div>
                        <div id="simplePrintAnswerKeyOptions" style="margin-left:26px;">
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                                <input type="radio" name="simplePrintAnswerType" id="simplePrintAnswersOnly" checked style="width:16px;height:16px;">
                                <label for="simplePrintAnswersOnly" style="font-size:0.85rem;color:var(--text-dim);">📝 Answers Only</label>
                            </div>
                            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                                <input type="radio" name="simplePrintAnswerType" id="simplePrintWorkedSolutions" style="width:16px;height:16px;">
                                <label for="simplePrintWorkedSolutions" style="font-size:0.85rem;color:var(--text-dim);">📚 Worked Solutions</label>
                            </div>
                            <div style="display:flex;align-items:center;gap:8px;">
                                <input type="checkbox" id="simplePrintSeparatePage" style="width:16px;height:16px;">
                                <label for="simplePrintSeparatePage" style="font-size:0.85rem;color:var(--text-dim);">Print on separate page</label>
                            </div>
                        </div>
                    </div>
                    
                    <button onclick="generateSimplePrint()" style="width:100%;padding:14px;background:linear-gradient(135deg, var(--accent-green), var(--accent-cyan));color:white;border:none;border-radius:10px;font-size:1.1rem;font-weight:700;cursor:pointer;">
                        🖨️ Generate & Print
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Add event listener for answer key checkbox
        setTimeout(() => {
            const akCheckbox = document.getElementById('simplePrintAnswerKey');
            const akOptions = document.getElementById('simplePrintAnswerKeyOptions');
            if (akCheckbox && akOptions) {
                akCheckbox.addEventListener('change', function() {
                    akOptions.style.opacity = this.checked ? '1' : '0.4';
                    akOptions.style.pointerEvents = this.checked ? 'auto' : 'none';
                });
            }
        }, 100);
    }
    
    // Store skills for printing
    window.simplePrintSkills = skills;
    
    // Update skills list display
    const listEl = document.getElementById('simplePrintSkillsList');
    if (listEl) {
        if (skills.length === 0) {
            listEl.innerHTML = '<div style="color:var(--text-dim);text-align:center;padding:10px;">No skills selected. Use search to add skills.</div>';
        } else {
            listEl.innerHTML = '<div style="font-weight:600;color:var(--accent-cyan);margin-bottom:8px;">📋 Skills to Print (' + skills.length + '):</div>' +
                skills.map(s => `<div style="padding:4px 8px;margin:4px 0;background:var(--bg-card);border-radius:6px;font-size:0.9rem;">• ${s.skillLabel || s.skillId}</div>`).join('');
        }
    }
    
    modal.style.display = 'flex';
}

export function closeSimplePrintModal() {
    const modal = document.getElementById('simplePrintModal');
    if (modal) modal.style.display = 'none';
}

export function generateSimplePrint() {
    const skills = window.simplePrintSkills || [];
    console.log('generateSimplePrint called with skills:', skills);
    
    if (skills.length === 0) {
        showNotification('Please add skills first using search', 'error');
        return;
    }
    
    const title = document.getElementById('simplePrintTitle')?.value || '';
    const count = parseInt(document.getElementById('simplePrintCount')?.value) || 20;
    const sets = parseInt(document.getElementById('simplePrintSets')?.value) || 1;
    const columns = parseInt(document.getElementById('simplePrintColumns')?.value) || 2;
    const style = document.getElementById('simplePrintStyle')?.value || 'color';
    
    console.log(`Print settings: count=${count}, sets=${sets}, columns=${columns}, style=${style}`);
    
    // Answer key options
    const includeAnswerKey = document.getElementById('simplePrintAnswerKey')?.checked !== false;
    const useWorkedSolutions = document.getElementById('simplePrintWorkedSolutions')?.checked || false;
    const separatePage = document.getElementById('simplePrintSeparatePage')?.checked || false;
    
    // Close modal
    closeSimplePrintModal();
    
    // Generate worksheet using existing function
    generateWorksheetFromSkills(skills, count, sets, title, columns, style, includeAnswerKey, useWorkedSolutions, separatePage);
}

export function generateWorksheetFromSkills(skills, problemCount, numSets, title, columns = 2, printStyle = 'color', includeAnswerKey = true, useWorkedSolutions = false, separatePage = false) {
    console.log(`generateWorksheetFromSkills: ${skills.length} skills, ${problemCount} problems, ${numSets} sets`);
    
    // Store skills for the print generator
    window.printQueuedSkills = skills;
    
    const range = parseInt(document.getElementById("rangeSelect")?.value) || 100;
    const decimals = parseInt(document.getElementById("decimalSelect")?.value) || 0;
    
    console.log(`Print range: ${range}, decimals: ${decimals}`);
    
    // Build skill list with weights
    const skillList = skills.map(s => ({ 
        categoryId: s.categoryId, 
        skillId: s.skillId,
        skillLabel: s.skillLabel || s.skillId,
        weight: s.percent || s.weight || 0  // Support both percent and weight
    }));
    
    console.log('Skill list for generation:', skillList);
    
    if (skillList.length === 0) {
        showNotification('No valid skills to print', 'error');
        return;
    }
    
    // Helper function to generate a problem for a specific skill
    function generateProblemForSkill(skillInfo) {
        // Save current state
        const savedCategory = state.category;
        const savedSkill = state.skill;
        const savedRange = state.range;
        
        // Set state for this skill
        state.category = skillInfo.categoryId;
        state.skill = skillInfo.skillId;
        state.range = range;
        
        console.log(`Generating problem for: category=${skillInfo.categoryId}, skill=${skillInfo.skillId}, range=${range}`);
        
        // Generate the problem
        try {
            const q = generateQuestion();
            
            // Restore state
            state.category = savedCategory;
            state.skill = savedSkill;
            state.range = savedRange;
            
            if (q && q.text) {
                console.log(`Generated question: "${q.text}", answer: ${q.ans}, hasVisual: ${!!q.visual}`);
                return {
                    text: q.text,
                    ans: q.ans,
                    skillLabel: q.skillLabel || skillInfo.skillLabel || '',
                    printFormat: q.printFormat || 'horizontal',
                    visual: q.visual || '',  // CRITICAL: Include visual for shapes, clocks, etc.
                    a: q.a,
                    b: q.b,
                    op: q.op,
                    answerType: q.answerType,
                    // Number Theory
                    factorPairsData: q.factorPairsData,
                    numberTheoryData: q.numberTheoryData,
                    // Time/Measurement
                    clockData: q.clockData,
                    measurementData: q.measurementData,
                    // Geometry
                    shapeData: q.shapeData,
                    geometryData: q.geometryData,
                    // Data & Statistics
                    dataData: q.dataData,
                    // Fractions
                    fractionData: q.fractionData,
                    // Decimals
                    decimalData: q.decimalData,
                    // Integers
                    integerData: q.integerData,
                    // Algebra
                    algebraData: q.algebraData,
                    // Patterns
                    patternData: q.patternData,
                    // Tables
                    tableData: q.tableData,
                    // Estimation
                    estimationData: q.estimationData,
                    // Area Models
                    areaModelData: q.areaModelData,
                    areaModelDivData: q.areaModelDivData,
                    // Fact/Number Families
                    factFamilyData: q.factFamilyData,
                    numberFamilyData: q.numberFamilyData,
                    // Ordering
                    orderData: q.orderData,
                    // Division notation
                    divisionNotation: q.divisionNotation,
                    // Misc
                    hint: q.hint,
                    dualAnswers: q.dualAnswers
                };
            } else {
                console.warn(`Generated question missing text for ${skillInfo.skillId}:`, q);
            }
        } catch(e) {
            console.error('Error generating problem:', e);
            // Restore state
            state.category = savedCategory;
            state.skill = savedSkill;
            state.range = savedRange;
        }
        return null;
    }
    
    // Helper to select a skill based on weights
    function selectSkillByWeight() {
        const totalWeight = skillList.reduce((sum, s) => sum + (s.weight || 0), 0);
        
        // If no weights set, distribute evenly
        if (totalWeight === 0) {
            return skillList[Math.floor(Math.random() * skillList.length)];
        }
        
        // Weighted random selection
        const roll = Math.random() * totalWeight;
        let cumulative = 0;
        for (const skill of skillList) {
            cumulative += (skill.weight || 0);
            if (roll < cumulative) {
                return skill;
            }
        }
        return skillList[skillList.length - 1];
    }
    
    // Greyscale filter style
    const greyscaleStyle = printStyle === 'greyscale' ? 'filter: grayscale(100%);' : '';
    
    // Generate worksheet HTML
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const worksheetTitle = title || 'Math Practice Worksheet';
    const getSetLabel = (i) => String.fromCharCode(65 + i);
    
    // Determine font size based on columns
    let problemFontSize = '16px';
    let problemPadding = '12px 8px';
    if (columns >= 10) {
        problemFontSize = '10px';
        problemPadding = '2px 1px';
    } else if (columns >= 6) {
        problemFontSize = '11px';
        problemPadding = '4px 2px';
    } else if (columns >= 4) {
        problemFontSize = '13px';
        problemPadding = '6px 4px';
    } else if (columns === 3) {
        problemFontSize = '14px';
        problemPadding = '8px 6px';
    }
    
    let allSetsHTML = '';
    
    for (let setNum = 0; setNum < numSets; setNum++) {
        // Generate fresh problems for each set
        const setProblems = [];
        const hasWeights = skillList.some(s => s.weight > 0);
        
        for (let i = 0; i < problemCount; i++) {
            // Select skill - either by weight or round-robin
            const skillInfo = hasWeights ? selectSkillByWeight() : skillList[i % skillList.length];
            
            const problem = generateProblemForSkill(skillInfo);
            if (problem) {
                setProblems.push(problem);
            } else {
                // Fallback: try a simple addition problem
                const a = Math.floor(Math.random() * 10) + 1;
                const b = Math.floor(Math.random() * 10) + 1;
                setProblems.push({
                    text: `${a} + ${b} = ___`,
                    ans: a + b,
                    skillLabel: 'Add',
                    printFormat: 'horizontal'
                });
            }
        }
        
        console.log(`Generated ${setProblems.length} problems for set ${setNum + 1}`);
        
        // Use formatProblemForPrint for proper visual rendering (clocks, shapes, factor links, etc.)
        const problemsHTML = setProblems.map((p, i) => formatProblemForPrint(p, i, columns)).join('');
        
        const answersHTML = setProblems.map((p, i) => 
            `<div class="answer-key-item"><span class="answer-key-num">${i + 1}.</span><span class="answer-key-ans">${p.ans}</span></div>`
        ).join('');
        
        // Only include answer key if requested
        let answerKeyHTML = '';
        if (includeAnswerKey && !separatePage) {
            answerKeyHTML = `<div class="answer-key-section"><div class="answer-key-title">📝 Answer Key</div><div class="answer-key-grid" style="grid-template-columns: repeat(${Math.min(columns * 2, 10)}, 1fr);">${answersHTML}</div></div>`;
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
                <div class="worksheet-problems" style="grid-template-columns: repeat(${columns}, 1fr);${columns >= 10 ? 'gap:6px 4px;' : columns >= 6 ? 'gap:10px 8px;' : ''}">${problemsHTML}</div>
                ${answerKeyHTML}
            </div>`;
        
        // Add separate page answer key if requested
        if (includeAnswerKey && separatePage) {
            allSetsHTML += `
                <div class="worksheet-set" style="page-break-before: always;${greyscaleStyle}">
                    <div style="font-weight:700;font-size:1.2rem;margin-bottom:15px;">📝 Answer Key${numSets > 1 ? ` - Set ${getSetLabel(setNum)}` : ''}</div>
                    <div class="answer-key-grid" style="grid-template-columns: repeat(${Math.min(columns * 2, 10)}, 1fr);">${answersHTML}</div>
                </div>`;
        }
    }
    
    // Show print preview
    const previewContent = document.getElementById('printPreviewContent');
    const previewContainer = document.getElementById('printPreviewContainer');
    
    if (previewContent && previewContainer) {
        previewContent.innerHTML = allSetsHTML;
        previewContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
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
