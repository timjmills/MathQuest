import { state } from './state.js';
import { DOMAINS, SKILLS, getSkillPrintSize, PRINT_SIZE_COLUMNS, getSkillGrade, gradeCircleHTML } from './data.js';
import { randInt, shuffle } from './utils.js';
import { generateQuestion } from './generate-question.js';
import { formatProblemForPrint } from './print-generate.js';
import { getSkillIndex } from './skill-search.js';

// ========== SHOW SKILL LABELS DEFAULT ==========
window.printShowSkillLabels = true;

// ========== SECTION COLORS ==========
const SECTION_COLORS = ['#0891b2', '#8b5cf6', '#ef4444', '#f59e0b', '#10b981', '#ec4899'];

// ========== PROBLEMS-PER-PAGE ESTIMATES BY SIZE CATEGORY ==========
// These are approximate counts of how many problems fit on one printed page
const PROBLEMS_PER_PAGE = {
    compact: 30,   // 3-col, ~10 rows
    standard: 16,  // 2-col, ~8 rows
    medium: 12,    // 2-col with visuals, ~6 rows
    wide: 5,       // 1-col large visuals
    spacious: 3    // 1-col word problems + work space
};

// For manual column overrides, estimate based on column count
const PROBLEMS_PER_PAGE_BY_COLS = {
    1: 5, 2: 16, 3: 24, 4: 32, 5: 40, 6: 48, 8: 56, 10: 60
};

// ========== PRINT SECTIONS STATE ==========
// window.printSections = [{ label, columns, problemCount, skills: [] }]
let nextSectionLetter = 1; // Tracks next letter index (0=A, 1=B, ...). Starts at 1 since Section A is created in init.

function initPrintSections(skills) {
    nextSectionLetter = 1; // Reset: Section A (index 0) is created below, next will be B (index 1)
    window.printSections = [{
        label: 'Section A',
        columns: 0,
        problemCount: 20,
        countMode: 'problems', // 'problems' or 'pages'
        pageCount: 1,
        groupByType: true,
        skills: skills.map(s => ({ ...s }))
    }];
}

function columnsDropdownHTML(id, selected) {
    const opts = [
        [0, 'Auto (Smart)'],
        [1, '1 Column'], [2, '2 Columns'], [3, '3 Columns'],
        [4, '4 Col (Facts)'], [5, '5 Col (Facts)'], [6, '6 Col (Facts)'],
        [8, '8 Col (Facts)'], [10, '10 Col (Fast Facts)']
    ];
    return `<select id="${id}" class="dropdown" style="width:100%;padding:8px;font-size:0.85rem;">${opts.map(([v, t]) =>
        `<option value="${v}"${v === selected ? ' selected' : ''}>${t}</option>`
    ).join('')}</select>`;
}

function problemCountDropdownHTML(id, selected) {
    const vals = [3, 6, 9, 10, 12, 15, 20, 24, 25, 30, 32, 40, 50, 60, 80, 100];
    return `<select id="${id}" class="dropdown" style="width:100%;padding:8px;font-size:0.85rem;">${vals.map(v =>
        `<option value="${v}"${v === selected ? ' selected' : ''}>${v}</option>`
    ).join('')}</select>`;
}

function pageCountDropdownHTML(id, selected) {
    const vals = [1, 2, 3, 4, 5, 6, 8, 10];
    return `<select id="${id}" class="dropdown" style="width:100%;padding:8px;font-size:0.85rem;">${vals.map(v =>
        `<option value="${v}"${v === selected ? ' selected' : ''}>${v} pg</option>`
    ).join('')}</select>`;
}

// Calculate estimated problems for a given page count and section config
export function calculateProblemsForPages(section) {
    const pages = section.pageCount || 1;
    const cols = section.columns;

    if (cols > 0) {
        // Manual column count — use column-based estimate
        const perPage = PROBLEMS_PER_PAGE_BY_COLS[cols] || (cols * 8);
        return pages * perPage;
    }

    // Auto layout — estimate based on skill sizes
    const skills = section.skills || [];
    if (skills.length === 0) return pages * 20;

    // Calculate weighted average problems per page based on skill size distribution
    let totalPerPage = 0;
    for (const sk of skills) {
        const size = getSkillPrintSize(sk.skillId || '', '');
        totalPerPage += (PROBLEMS_PER_PAGE[size] || 16);
    }
    const avgPerPage = Math.round(totalPerPage / skills.length);
    return pages * avgPerPage;
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
                        <div style="display:flex;gap:2px;">
                            <button id="psModeProblems_${sIdx}" onclick="setPrintCountMode(${sIdx},'problems')"
                                style="font-size:0.6rem;padding:1px 4px;border:1px solid ${(sec.countMode || 'problems') === 'problems' ? 'var(--accent-cyan)' : 'var(--border)'};background:${(sec.countMode || 'problems') === 'problems' ? 'var(--accent-cyan)' : 'transparent'};color:${(sec.countMode || 'problems') === 'problems' ? 'white' : 'var(--text-dim)'};border-radius:4px 0 0 4px;cursor:pointer;font-weight:600;">#</button>
                            <button id="psModePages_${sIdx}" onclick="setPrintCountMode(${sIdx},'pages')"
                                style="font-size:0.6rem;padding:1px 4px;border:1px solid ${sec.countMode === 'pages' ? 'var(--accent-cyan)' : 'var(--border)'};background:${sec.countMode === 'pages' ? 'var(--accent-cyan)' : 'transparent'};color:${sec.countMode === 'pages' ? 'white' : 'var(--text-dim)'};border-radius:0 4px 4px 0;cursor:pointer;font-weight:600;">Pg</button>
                        </div>
                        <div id="psCountWrap_${sIdx}">
                            ${(sec.countMode || 'problems') === 'pages'
                                ? pageCountDropdownHTML(`psSectionPages_${sIdx}`, sec.pageCount || 1)
                                : problemCountDropdownHTML(`psSectionCount_${sIdx}`, sec.problemCount)}
                        </div>
                    </div>
                    <div style="display:flex;align-items:center;gap:4px;margin-left:4px;">
                        <input type="checkbox" id="psSectionGroup_${sIdx}" ${sec.groupByType !== false ? 'checked' : ''} style="width:14px;height:14px;">
                        <label for="psSectionGroup_${sIdx}" style="font-size:0.65rem;color:var(--text-dim);font-weight:600;">GROUP</label>
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
            const pgSel = document.getElementById(`psSectionPages_${sIdx}`);
            const grpChk = document.getElementById(`psSectionGroup_${sIdx}`);
            if (colSel) colSel.onchange = () => { sec.columns = parseInt(colSel.value); };
            if (cntSel) cntSel.onchange = () => { sec.problemCount = parseInt(cntSel.value); };
            if (pgSel) pgSel.onchange = () => { sec.pageCount = parseInt(pgSel.value); };
            if (grpChk) grpChk.onchange = () => { sec.groupByType = grpChk.checked; };
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
    const letter = String.fromCharCode(65 + nextSectionLetter);
    nextSectionLetter++;
    window.printSections.push({
        label: `Section ${letter}`,
        columns: 0,
        problemCount: 20,
        countMode: 'problems',
        pageCount: 1,
        groupByType: true,
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

// ========== COUNT MODE TOGGLE ==========
export function setPrintCountMode(sIdx, mode) {
    if (!window.printSections || !window.printSections[sIdx]) return;
    window.printSections[sIdx].countMode = mode;
    renderPrintSections();
}

// ========== AUTO-GROUP SECTIONS BY SIZE ==========
export function autoGroupPrintSections() {
    if (!window.printSections) return;

    // Collect all skills from all sections
    const allSkills = [];
    for (const sec of window.printSections) {
        for (const sk of sec.skills) {
            allSkills.push({ ...sk });
        }
    }
    if (allSkills.length === 0) return;

    // Group skills by their natural column count
    const groups = {};
    for (const sk of allSkills) {
        const size = getSkillPrintSize(sk.skillId || '', '');
        const cols = PRINT_SIZE_COLUMNS[size] || 3;
        if (!groups[cols]) groups[cols] = { skills: [], sizes: new Set() };
        groups[cols].skills.push(sk);
        groups[cols].sizes.add(size);
    }

    // Sort by column count descending (3-col first, then 2, then 1)
    const sortedCols = Object.keys(groups).map(Number).sort((a, b) => b - a);

    // Reset section letter counter (autoGroup replaces all sections)
    nextSectionLetter = sortedCols.length;

    // Create sections
    const SIZE_LABELS = {
        compact: 'Facts',
        standard: 'Standard',
        medium: 'Visual',
        wide: 'Wide Visual',
        spacious: 'Word Problems'
    };

    window.printSections = sortedCols.map((cols, i) => {
        const group = groups[cols];
        const sizeNames = [...group.sizes].map(s => SIZE_LABELS[s] || s).join(' & ');
        return {
            label: `${sizeNames} (${cols}-col)`,
            columns: cols,
            problemCount: 20,
            countMode: 'problems',
            pageCount: 1,
            groupByType: true,
            skills: group.skills
        };
    });

    renderPrintSections();
}

// ========== SEARCH IN PRINT DIALOG ==========
let printDialogSearchMouseDown = false;

export function handlePrintDialogSearch(query) {
    const resultsDiv = document.getElementById('printDialogSearchResults');
    if (!resultsDiv) return;
    if (!query || query.trim().length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }

    const index = getSkillIndex();
    const lowerQuery = query.toLowerCase().trim();
    const terms = lowerQuery.split(/\s+/);

    const matches = index.filter(item => {
        // Skip mixed/meta skills
        if (item.skillId === 'mixed' || item.skillId.startsWith('mixed_')) return false;
        return terms.every(term => item.searchText.includes(term));
    }).slice(0, 12);

    if (matches.length === 0) {
        resultsDiv.innerHTML = '<div style="padding:12px;color:var(--text-dim);text-align:center;font-size:0.85rem;">No skills found.</div>';
        resultsDiv.style.display = 'block';
        return;
    }

    // Check which skills are already in any section
    const inSections = new Set();
    if (window.printSections) {
        for (const sec of window.printSections) {
            for (const sk of sec.skills) {
                inSections.add(sk.skillId);
            }
        }
    }

    let html = '';
    let lastDomain = '';
    for (const match of matches) {
        if (match.domainId !== lastDomain) {
            if (lastDomain !== '') html += '</div>';
            html += `<div style="padding:4px 10px;background:${match.domainColor}22;font-weight:600;font-size:0.75rem;color:${match.domainColor};">${match.domainIcon} ${match.domainName}</div><div>`;
            lastDomain = match.domainId;
        }
        const isIn = inSections.has(match.skillId);
        const safeLabel = (match.skillLabel || '').replace(/'/g, "\\'");
        const safeCatName = (match.categoryName || '').replace(/'/g, "\\'");
        html += `<div style="display:flex;align-items:center;padding:6px 10px;cursor:pointer;border-bottom:1px solid var(--border);gap:6px;"
            onmouseover="this.style.background='var(--bg-card-light)'" onmouseout="this.style.background='transparent'"
            onclick="togglePrintDialogSkill('${match.domainId}','${match.categoryId}','${match.skillId}','${safeLabel}','${match.categoryIcon}','${safeCatName}','${match.domainColor}')">
            <div style="flex:1;">
                <div style="font-size:0.85rem;color:var(--text);">${match.skillLabel}</div>
                <div style="font-size:0.7rem;color:var(--text-dim);">${match.categoryIcon} ${match.categoryName}</div>
            </div>
            <span style="width:24px;height:24px;border-radius:50%;border:2px solid ${isIn ? '#10b981' : 'var(--accent-cyan)'};background:${isIn ? '#10b981' : 'transparent'};color:${isIn ? 'white' : 'var(--accent-cyan)'};display:flex;align-items:center;justify-content:center;font-size:0.85rem;font-weight:700;flex-shrink:0;">${isIn ? '&#10003;' : '+'}</span>
        </div>`;
    }
    if (lastDomain !== '') html += '</div>';

    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
}

export function togglePrintDialogSkill(domainId, categoryId, skillId, skillLabel, categoryIcon, categoryName, domainColor) {
    printDialogSearchMouseDown = true;
    if (!window.printSections || window.printSections.length === 0) return;

    // Check if skill is in any section
    for (let sIdx = 0; sIdx < window.printSections.length; sIdx++) {
        const sec = window.printSections[sIdx];
        const skIdx = sec.skills.findIndex(sk => sk.skillId === skillId);
        if (skIdx !== -1) {
            // Remove it (toggle off)
            sec.skills.splice(skIdx, 1);
            renderPrintSections();
            // Refresh search
            const q = document.getElementById('printDialogSearchInput')?.value;
            if (q) handlePrintDialogSearch(q);
            setTimeout(() => {
                const inp = document.getElementById('printDialogSearchInput');
                if (inp) inp.focus();
                printDialogSearchMouseDown = false;
            }, 50);
            return;
        }
    }

    // Add to first section (toggle on)
    window.printSections[0].skills.push({
        categoryId,
        skillId,
        skillLabel: skillLabel.replace(/^[^\w]*/, ''),
        categoryIcon,
        categoryName,
        domainColor,
        percent: 0
    });
    renderPrintSections();

    // Refresh search
    const q = document.getElementById('printDialogSearchInput')?.value;
    if (q) handlePrintDialogSearch(q);
    setTimeout(() => {
        const inp = document.getElementById('printDialogSearchInput');
        if (inp) inp.focus();
        printDialogSearchMouseDown = false;
    }, 50);
}

export function hidePrintDialogSearch() {
    setTimeout(() => {
        if (!printDialogSearchMouseDown) {
            const r = document.getElementById('printDialogSearchResults');
            if (r) r.style.display = 'none';
        }
    }, 250);
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

                <!-- Search Skills -->
                <div style="margin-bottom:12px;position:relative;">
                    <label style="display:block;font-weight:600;margin-bottom:4px;color:var(--text-dim);font-size:0.8rem;">ADD SKILLS</label>
                    <input type="text" id="printDialogSearchInput" placeholder="Search skills to add..."
                        oninput="handlePrintDialogSearch(this.value)"
                        onfocus="handlePrintDialogSearch(this.value)"
                        onblur="hidePrintDialogSearch()"
                        style="width:100%;padding:9px 12px;border:2px solid var(--bg-card-light);border-radius:8px;background:var(--bg-card);color:var(--text-bright);font-size:0.9rem;">
                    <div id="printDialogSearchResults" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:100;max-height:250px;overflow-y:auto;background:var(--bg-card);border:2px solid var(--accent-cyan);border-radius:0 0 10px 10px;box-shadow:0 6px 20px rgba(0,0,0,0.2);"></div>
                </div>

                <!-- Sections -->
                <div style="margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;">
                    <label style="font-weight:700;color:var(--text);font-size:0.95rem;">Sections</label>
                    <div style="display:flex;gap:6px;align-items:center;">
                        <button onclick="autoGroupPrintSections()" style="padding:4px 10px;background:var(--accent-purple);color:white;border:none;border-radius:6px;font-size:0.75rem;font-weight:600;cursor:pointer;" title="Auto-group skills into sections by size">Auto-Group</button>
                        <span style="font-size:0.7rem;color:var(--text-dim);">Drag skills between sections</span>
                    </div>
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

                <!-- Skill Labels Toggle -->
                <div style="margin-bottom:14px;padding:10px;background:var(--bg-card-light);border-radius:10px;">
                    <label style="display:flex;align-items:center;gap:6px;font-size:0.85rem;cursor:pointer;">
                        <input type="checkbox" id="printShowSkillLabels" checked onchange="window.printShowSkillLabels=this.checked" style="width:16px;height:16px;">
                        Show Skill Labels
                    </label>
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
        const pgSel = document.getElementById(`psSectionPages_${sIdx}`);
        const grpChk = document.getElementById(`psSectionGroup_${sIdx}`);
        if (colSel) { const v = parseInt(colSel.value); sec.columns = isNaN(v) ? 2 : v; }
        if (cntSel) sec.problemCount = parseInt(cntSel.value) || 20;
        if (pgSel) sec.pageCount = parseInt(pgSel.value) || 1;
        if (grpChk) sec.groupByType = grpChk.checked;

        // If page mode, calculate problem count from pages
        if (sec.countMode === 'pages') {
            sec.problemCount = calculateProblemsForPages(sec);
        }
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

    // Pre-compute cross-set skill distribution for each section
    // When skills > problemCount, distribute skill types across sets so weights are met over total
    const sectionDistributions = activeSections.map(sec => {
        const skillList = sec.skills.map(s => ({
            categoryId: s.categoryId,
            skillId: s.skillId,
            skillLabel: s.skillLabel || s.skillId,
            weight: s.percent || s.weight || 0
        }));
        const hasWeights = skillList.some(s => s.weight > 0);
        const problemCount = sec.problemCount || 20;
        const totalProblems = problemCount * numSets;

        if (numSets <= 1 || skillList.length <= problemCount) {
            // No cross-set distribution needed
            return null;
        }

        // Calculate target counts per skill across ALL sets
        const targets = [];
        if (hasWeights) {
            const totalWeight = skillList.reduce((sum, s) => sum + s.weight, 0);
            for (const sk of skillList) {
                targets.push({
                    skill: sk,
                    target: sk.weight > 0 ? Math.max(1, Math.round((sk.weight / totalWeight) * totalProblems)) : 0
                });
            }
        } else {
            const perSkill = Math.max(1, Math.round(totalProblems / skillList.length));
            for (const sk of skillList) {
                targets.push({ skill: sk, target: perSkill });
            }
        }

        // Distribute into per-set allocations
        const perSetAllocations = [];
        const remaining = targets.map(t => ({ ...t, left: t.target }));

        for (let s = 0; s < numSets; s++) {
            const allocation = [];
            let budget = problemCount;

            // Sort by remaining (most needed first)
            remaining.sort((a, b) => b.left - a.left);

            for (const entry of remaining) {
                if (budget <= 0) break;
                // Proportional share for this set
                const setsLeft = numSets - s;
                const share = Math.max(entry.left > 0 ? 1 : 0, Math.round(entry.left / setsLeft));
                const give = Math.min(share, budget);
                if (give > 0) {
                    allocation.push({ skill: entry.skill, count: give });
                    entry.left -= give;
                    budget -= give;
                }
            }

            // Fill remaining budget with round-robin from skills with most remaining
            while (budget > 0) {
                remaining.sort((a, b) => b.left - a.left);
                const pick = remaining[0];
                const existing = allocation.find(a => a.skill.skillId === pick.skill.skillId);
                if (existing) existing.count++;
                else allocation.push({ skill: pick.skill, count: 1 });
                pick.left--;
                budget--;
            }

            perSetAllocations.push(allocation);
        }

        return perSetAllocations;
    });

    let allSetsHTML = '';

    for (let setNum = 0; setNum < numSets; setNum++) {
        let sectionsHTML = '';
        let globalProblemIdx = 0;
        let allAnswers = [];

        for (let secIdx = 0; secIdx < activeSections.length; secIdx++) {
            const sec = activeSections[secIdx];
            const columns = sec.columns != null ? sec.columns : 2;
            const problemCount = sec.problemCount || 20;
            const skillList = sec.skills.map(s => ({
                categoryId: s.categoryId,
                skillId: s.skillId,
                skillLabel: s.skillLabel || s.skillId,
                weight: s.percent || s.weight || 0
            }));

            const hasWeights = skillList.some(s => s.weight > 0);
            const problems = [];

            const distribution = sectionDistributions[secIdx];
            if (distribution) {
                // Cross-set distribution: use pre-computed allocation for this set
                const allocation = distribution[setNum] || [];
                for (const entry of allocation) {
                    for (let c = 0; c < entry.count; c++) {
                        const problem = generateProblemForSkillStatic(entry.skill, range, decimals);
                        const p = problem || generateCategoryFallbackStatic(entry.skill);
                        if (!p.skillId) p.skillId = entry.skill.skillId;
                        if (!p.categoryId) p.categoryId = entry.skill.categoryId;
                        problems.push(p);
                    }
                }
            } else {
                // Normal generation (single set or few skills)
                for (let i = 0; i < problemCount; i++) {
                    const skillInfo = hasWeights
                        ? selectSkillByWeightFromList(skillList)
                        : skillList[i % skillList.length];
                    const problem = generateProblemForSkillStatic(skillInfo, range, decimals);
                    const p = problem || generateCategoryFallbackStatic(skillInfo);
                    if (!p.skillId) p.skillId = skillInfo.skillId;
                    if (!p.categoryId) p.categoryId = skillInfo.categoryId;
                    problems.push(p);
                }
            }

            // Section label in worksheet (only if more than one section)
            const sectionLabel = activeSections.length > 1
                ? `<div style="font-weight:700;font-size:1.1rem;margin:18px 0 10px;padding-bottom:6px;border-bottom:2px solid #333;">${sec.label}</div>`
                : '';

            if (columns === 0) {
                // AUTO LAYOUT: classify, optionally sort, group into sub-grids
                const classified = problems.map((p, i) => ({
                    problem: p,
                    idx: globalProblemIdx + i,
                    size: getSkillPrintSize(p.skillId || '', p.printFormat || '')
                }));

                // Optionally sort by size category to group similar problems
                if (sec.groupByType !== false) {
                    const SIZE_ORDER = { compact: 0, standard: 1, medium: 2, wide: 3, spacious: 4 };
                    classified.sort((a, b) => (SIZE_ORDER[a.size] || 1) - (SIZE_ORDER[b.size] || 1));
                }

                // Group consecutive problems with same size
                const groups = [];
                let curGroup = null;
                for (const item of classified) {
                    const cols = PRINT_SIZE_COLUMNS[item.size] || 3;
                    if (!curGroup || curGroup.cols !== cols) {
                        curGroup = { cols, size: item.size, items: [] };
                        groups.push(curGroup);
                    }
                    curGroup.items.push(item);
                }

                // Auto-fill: generate extra problems to complete partial rows
                for (const group of groups) {
                    const gc = group.cols;
                    const count = group.items.length;
                    const remainder = count % gc;
                    if (remainder > 0) {
                        const needed = gc - remainder;
                        const sampleItems = group.items;
                        for (let extra = 0; extra < needed; extra++) {
                            const donor = sampleItems[extra % sampleItems.length];
                            const skillInfo = {
                                categoryId: donor.problem.categoryId || sec.skills[0]?.categoryId,
                                skillId: donor.problem.skillId || sec.skills[0]?.skillId,
                                skillLabel: donor.problem.skillLabel || sec.skills[0]?.skillLabel || '',
                                weight: 0
                            };
                            const ep = generateProblemForSkillStatic(skillInfo, range, decimals) || generateCategoryFallbackStatic(skillInfo);
                            if (!ep.skillId) ep.skillId = skillInfo.skillId;
                            if (!ep.categoryId) ep.categoryId = skillInfo.categoryId;
                            const newIdx = globalProblemIdx + problems.length;
                            problems.push(ep);
                            group.items.push({ problem: ep, idx: newIdx, size: group.size });
                        }
                    }
                }

                // Reassign sequential numbering after sorting/auto-fill
                let seqIdx = globalProblemIdx;
                for (const group of groups) {
                    for (const item of group.items) {
                        item.idx = seqIdx++;
                    }
                }

                // Render each sub-grid
                let subGridsHTML = '';
                const showLabels = window.printShowSkillLabels !== false;
                for (const group of groups) {
                    const gc = group.cols;
                    const count = group.items.length;
                    const evenDistribute = count < gc && count <= 3;
                    const actualCols = evenDistribute ? count : gc;
                    const gapStr = actualCols >= 4 ? '6px' : actualCols >= 3 ? '12px 10px' : actualCols >= 2 ? '16px 14px' : '20px';
                    const sizeClass = `ws-subgrid ws-subgrid-${group.size}`;
                    const problemsInGroup = group.items.map(item =>
                        formatProblemForPrint(item.problem, item.idx, actualCols, group.size, showLabels)
                    ).join('');
                    let evenStyle = '';
                    if (evenDistribute) {
                        const maxW = count <= 2 ? 'max-width:70%;' : 'max-width:90%;';
                        evenStyle = `${maxW}margin:0 auto;`;
                    }
                    subGridsHTML += `<div class="${sizeClass}" style="grid-template-columns:repeat(${actualCols},1fr);gap:${gapStr};${evenStyle}">${problemsInGroup}</div>`;
                }

                sectionsHTML += `${sectionLabel}${subGridsHTML}`;

                // Build answer key from display order (after sort)
                for (const group of groups) {
                    for (const item of group.items) {
                        allAnswers.push({ idx: item.idx, ans: item.problem.ans });
                    }
                }
                globalProblemIdx = seqIdx;
            } else {
                // MANUAL LAYOUT: existing behavior
                const gridGap = columns >= 10 ? '6px 4px' : columns >= 6 ? '10px 8px' : columns >= 3 ? '15px 12px' : '22px 20px';
                const manualShowLabels = window.printShowSkillLabels !== false;
                const problemsHTML = problems.map((p, i) => {
                    const size = getSkillPrintSize(p.skillId || '', p.printFormat || '');
                    return formatProblemForPrint(p, globalProblemIdx + i, columns, size, manualShowLabels);
                }).join('');
                sectionsHTML += `${sectionLabel}<div class="worksheet-problems" style="grid-template-columns:repeat(${columns},1fr);gap:${gridGap};">${problemsHTML}</div>`;

                problems.forEach((p, i) => {
                    allAnswers.push({ idx: globalProblemIdx + i, ans: p.ans });
                });
                globalProblemIdx += problems.length;
            }
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

        if (setNum > 0) {
            allSetsHTML += `<div class="ws-page-break-indicator">\u2014 Page Break \u2014</div>`;
        }
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
            allSetsHTML += `<div class="ws-page-break-indicator">\u2014 Page Break (Answer Key) \u2014</div>`;
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
                skillId: q.skillId || skillInfo.skillId,
                categoryId: skillInfo.categoryId,
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
    return { text, ans, skillLabel: label, printFormat: 'horizontal', a, b, op, skillId: skillInfo.skillId, categoryId: skillInfo.categoryId };
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
    
    // Count total skills from queuedPrintSkills (object of {categoryId: [skillIds]})
    const totalApplied = Object.values(window.queuedPrintSkills).reduce((sum, arr) => sum + arr.length, 0);

    // Show notification
    showNotification(`Applied ${totalApplied} selected skill${totalApplied > 1 ? 's' : ''} to print settings`, 'success');
    
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
