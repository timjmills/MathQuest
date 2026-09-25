import { state } from './state.js';
import { SKILLS, SKILL_CODES, CODE_TO_SKILL, DOMAINS, getSkillGrade, gradeCircleHTML, getPositionalSkills } from './data.js';
import { mergedSkillFor } from './skill-aliases.js';
import { optionSuffix, decodeOptionPayload, splitOptionSuffix } from './skill-option-codec.js';
import { getSetOptions, setSetOptions, deleteSetOptions, restoreSetOptions } from './skill-option-store.js';
import { registerSkillOptionsHost, skillOptionsGearHTML, skillOptionsPanelHTML, skillOptionsSummaryHTML } from './skill-options-ui.js';

// The share panel's skill list is an options host: each row gets the ⚙ Options panel, and the
// chosen values go straight into the link and the code below it.
registerSkillOptionsHost('queue', {
    entry: (i) => (window.skillQueue && window.skillQueue[i]) || null,
    rerender: () => renderWeightedSkillsList(),
});

// ========== SKILL OPTIONS IN SHARE CODES (owner, 2026-09-24) ==========
// Every code below may carry a skill's chosen options as an optional "~payload" suffix on that
// skill's own reference — "EA~C78" is mult_facts drilling only the 7s and 8s. The grammar, the
// keys and the compatibility argument are in skill-option-codec.js and design/SHARE_CODES.md.
// A skill at its defaults writes no suffix, so every code a set made before this existed is
// still produced (and still decoded) byte-for-byte.

export function generateSkillCode() {
    if (window.skillQueue.length === 0) return '---';

    const parts = [];
    for (const skill of window.skillQueue) {
        const key = `${skill.categoryId}:${skill.skillId}`;
        const code = SKILL_CODES[key];
        if (code) {
            // Add weight if not 0
            const weight = skill.weight || 0;
            const opts = optionSuffix(skill.categoryId, skill.skillId, getSetOptions(skill.categoryId, skill.skillId));
            if (weight > 0 && weight !== 1) {
                parts.push(code + weight + opts);
            } else {
                parts.push(code + opts);
            }
        }
    }

    return parts.length > 0 ? parts.join('-') : '---';
}

/**
 * Parse a 2-char skill code ("AB-CD5-EA~C78") into skills with weight and options.
 * Format per part: CODE(2) [weight digits] [~options]. Pure: touches no DOM and no state, so the
 * share-code tests can call it directly. Unknown codes are skipped, as they always were.
 */
export function parseSkillCodeParts(rawCode) {
    const loaded = [];
    for (const rawPart of String(rawCode || '').toUpperCase().replace(/\s+/g, '').split('-')) {
        const { head: part, payload } = splitOptionSuffix(rawPart);
        if (part.length < 2) continue;
        // Extract code and optional weight
        const code = part.substring(0, 2);
        const weightStr = part.substring(2);
        const weight = weightStr ? parseInt(weightStr, 10) : 0;
        const skillInfo = CODE_TO_SKILL[code];
        if (skillInfo) {
            loaded.push({
                categoryId: skillInfo.categoryId,
                skillId: skillInfo.skillId,
                skillLabel: skillInfo.skillLabel,
                weight: isNaN(weight) ? 0 : weight,
                opts: payload ? decodeOptionPayload(skillInfo.categoryId, skillInfo.skillId, payload) : {},
            });
        }
    }
    return loaded;
}

/** True for a skill code whose parts carry "~options" (a 2-char code, optional weight, payload). */
export function isSkillCodeWithOptions(rawCode) {
    const c = String(rawCode || '');
    if (!c.includes('~') || c.startsWith('MX-')) return false;
    const PART = /^[A-Z0-9]{2}[0-9]{0,3}(~[A-Z0-9_]*)?$/i;
    return c.split('-').every(p => PART.test(p));
}

// Apply a skill code - parse and load skills into queue
export function applySkillCode(inputId) {
    const input = document.getElementById(inputId || 'studentCodeInput') || document.getElementById('teacherCodeInput');
    if (!input) return;

    const rawCode = (input.value || '').toUpperCase().trim().replace(/\s+/g, '');
    if (!rawCode || rawCode === '---') {
        showNotification('Please enter a code', 'error');
        return;
    }

    // Parse the code - format: AB-CD-EF, AB3-CD5-EF2, and now EA~C78 (options, see above)
    const loadedSkills = parseSkillCodeParts(rawCode);

    if (loadedSkills.length === 0) {
        showNotification('Invalid code - no skills found', 'error');
        input.style.borderColor = 'var(--incorrect)';
        setTimeout(() => { input.style.borderColor = 'var(--accent-orange)'; }, 1500);
        return;
    }

    // Clear current queue using UnifiedSkills
    UnifiedSkills.clear();

    // Add skills via UnifiedSkills
    for (const skill of loadedSkills) {
        const domainId = getDomainByCategory(skill.categoryId) || 'number_operations';
        const domain = DOMAINS[domainId];
        const categoryInfo = domain?.categories?.find(c => c.id === skill.categoryId);

        UnifiedSkills.add({
            domainId: domainId,
            categoryId: skill.categoryId,
            skillId: skill.skillId,
            skillLabel: skill.skillLabel,
            categoryIcon: categoryInfo?.icon || '📚',
            categoryName: categoryInfo?.name || skill.categoryId,
            domainColor: domain?.color || '#4CAF50',
            weight: skill.weight || 0,
            opts: skill.opts || {}
        });
    }

    // Apply weights to skillQueue (which was synced by UnifiedSkills)
    for (let i = 0; i < loadedSkills.length && i < window.skillQueue.length; i++) {
        window.skillQueue[i].weight = loadedSkills[i].weight || 0;
    }

    // Expand the queue to show loaded skills
    UnifiedSkills.expanded = true;
    UnifiedSkills.updateAllUI();
    updateQuickSkillCards();
    updateCompactNumberVisibility();

    // Success feedback
    input.style.borderColor = 'var(--correct)';
    input.style.background = 'rgba(6,214,160,0.2)';
    showNotification(`✓ Loaded ${loadedSkills.length} skill(s)!`, 'success');

    setTimeout(() => {
        input.style.borderColor = 'var(--accent-orange)';
        input.style.background = 'var(--bg-card)';
        input.value = '';
    }, 1500);
}

// Copy skill code to clipboard
export function copySkillCode() {
    const code = generateSkillCode();
    if (code === '---') {
        showNotification('No skills selected', 'error');
        return;
    }

    navigator.clipboard.writeText(code).then(() => {
        showNotification('📋 Code copied!', 'success');
    }).catch(() => {
        // Fallback
        const input = document.createElement('input');
        input.value = code;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showNotification('📋 Code copied!', 'success');
    });
}

// Update skill code display whenever queue changes
export function updateSkillCodeDisplay() {
    const codeDisplay = document.getElementById('skillCodeDisplay');
    if (codeDisplay) {
        codeDisplay.textContent = generateSkillCode();
    }
}

// Update skill weight in queue
export function updateSkillWeight(index, weight) {
    if (window.skillQueue[index]) {
        // Allow weights 0-100 for percentage-based distribution
        window.skillQueue[index].weight = Math.max(0, Math.min(100, parseInt(weight) || 0));
        updateSkillCodeDisplay();
        renderWeightedSkillsList();
    }
}

// Render weighted skills list for teacher view
export function renderWeightedSkillsList() {
    const container = document.getElementById('weightedSkillsList');
    if (!container) return;

    if (window.skillQueue.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--text-dim);padding:10px;">No skills selected. Use search to add skills.</div>';
        return;
    }

    container.innerHTML = window.skillQueue.map((skill, index) => {
        const shortLabel = skill.skillLabel.replace(/^[🟢🟡🟠🔴➕➖✖️➗📐📏⏰½🔬]+\s*/, '').substring(0, 30);
        const gc = gradeCircleHTML(getSkillGrade(skill.skillId, skill.categoryId));
        const color = skill.domainColor || '#8b5cf6';
        return `<div class="sko-row" data-sko-host="queue" data-idx="${index}">
            <div style="display:flex;align-items:center;gap:8px 10px;padding:8px 12px;background:var(--bg-card);border-radius:8px;border-left:4px solid ${skill.domainColor || 'var(--accent-purple)'};flex-wrap:wrap;">
                <span style="font-weight:600;color:var(--text);flex:1 1 160px;min-width:0;display:flex;align-items:center;gap:6px;"><span>${index + 1}.</span> ${gc}<span style="min-width:0;">${shortLabel}${skillOptionsSummaryHTML(skill.categoryId, skill.skillId)}</span></span>
                ${skillOptionsGearHTML('queue', index, skill.categoryId, skill.skillId, color)}
                <div style="display:flex;align-items:center;gap:6px;">
                    <span style="font-size:0.75rem;color:var(--text-dim);">Weight:</span>
                    <input type="number" min="0" max="100" value="${skill.weight || 0}"
                        onchange="updateSkillWeight(${index}, this.value)"
                        style="width:50px;padding:4px 6px;text-align:center;border:2px solid var(--accent-purple);border-radius:6px;background:var(--bg-card);color:var(--text-bright);font-weight:600;">
                </div>
                <button onclick="removeFromQueue(${index})" style="width:24px;height:24px;border-radius:50%;background:var(--incorrect);color:white;border:none;cursor:pointer;font-size:0.9rem;">×</button>
            </div>
            ${skillOptionsPanelHTML('queue', index, skill.categoryId, skill.skillId, color)}
        </div>`;
    }).join('');

    // Update code display
    updateSkillCodeDisplay();
}

// Remove skill from queue by index
export function removeFromQueue(index) {
    if (index >= 0 && index < window.skillQueue.length) {
        UnifiedSkills.removeByIndex(index);
        updateQuickSkillCards();
        updateCompactNumberVisibility();
    }
}
// ========== END COMPACT SKILL CODE SYSTEM ==========

// Generate a shareable link with the current mixed mode code
export function generateMixedLink() {
    const code = document.getElementById('mixedCodeDisplay').textContent;
    if (!code || code === '---') return '';

    // Get current URL without parameters
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?c=${code}`;
}

// Copy the shareable link to clipboard
export function copyMixedLink() {
    const link = generateMixedLink();
    if (!link) {
        showToast('Select at least one skill first', 'error');
        return;
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link).then(() => {
            showToast('Link copied! Share with students', 'success');
        }).catch(() => {
            showToast('Could not copy link', 'error');
        });
    }
}

// Show toast notification

// Encode a skill as its POSITION in the category's frozen positional list.
//
// Returns null - not '00' - when the skill cannot be encoded. '00' is a perfectly valid code
// for the FIRST skill of the category, so the old fallback quietly minted a code for a
// different skill than the one the teacher was looking at. Two ways to fail:
//   - the skill is not in this category's positional list (wrong category, or a typo'd id);
//   - the position is >= 100 and no longer fits the two-character slot. Skill ids are appended
//     over time (see R1), so this WILL happen one day; a 3-digit index would silently shift
//     every later field of the 7-character code, so refuse it instead.
export function getSkillCode(category, skillValue) {
    const skills = getPositionalSkills(category);
    const idx = skills.findIndex(s => s.v === skillValue);
    if (idx < 0 || idx > 99) return null;
    return idx.toString().padStart(2, '0');
}

// Decode a position back to a skill id.
//
// strict:false (the default) keeps the historic lenient behaviour - an out-of-range index falls
// back to the category's first skill - because the MX- and compact-M parsers in
// mixed-mode-play.js decode a whole basket of skills at once and are not mine to change this
// wave; handing them null would push a null into selectedSkills and break play harder than the
// wrong-but-playable skill they get today.
//
// strict:true returns null instead, and is what the 7-character settings code uses: there the
// index IS the worksheet, so a bad code must raise an error a teacher can see rather than
// silently open somebody else's skill.
export function getSkillFromCode(category, code, { strict = false } = {}) {
    const skills = getPositionalSkills(category);
    const raw = String(code == null ? '' : code).trim();
    const idx = /^\d+$/.test(raw) ? parseInt(raw, 10) : NaN;
    const hit = Number.isInteger(idx) ? skills[idx] : undefined;
    if (hit) return hit.v;
    if (strict) return null;
    return skills[0]?.v || 'mixed';
}

// Point the three dropdowns at a category, hopping the DOMAIN first.
//
// categorySelect only lists the categories of the domain currently chosen (updateCategoryOptions),
// so assigning a category from another domain leaves the select on selectedIndex -1 and the code
// opens nothing. Two of the seven domains (counting_cardinality, vocabulary) are not even listed
// in the domain dropdown in index.html, so those fall back to "All Domains", which lists every
// category. Returns true when the category really landed.
function selectCategoryInPicker(categoryId) {
    const categorySelect = document.getElementById("categorySelect");
    if (!categorySelect) return false;
    const domainSelect = document.getElementById("domainSelect");
    if (domainSelect) {
        const domainId = (typeof getDomainByCategory === 'function' ? getDomainByCategory(categoryId) : null);
        domainSelect.value = domainId || 'all_domains';
        if (domainSelect.selectedIndex === -1) domainSelect.value = 'all_domains';
        updateCategoryOptions();
    }
    categorySelect.value = categoryId;
    return categorySelect.selectedIndex !== -1;
}

// Generate settings code from current UI state
export function generateSettingsCode() {
    const category = document.getElementById("categorySelect")?.value || 'addition';
    const skill = document.getElementById("skillSelect")?.value || 'add';
    const range = document.getElementById("rangeSelect")?.value || '100';
    const decimal = document.getElementById("decimalSelect")?.value || '0';
    const timer = document.getElementById("timerSelect")?.value || '180';
    const difficulty = 'medium'; // Deprecated: always medium

    // No fallback here. The old `CATEGORY_CODES[category] || 'A'` is what broke the feature:
    // every unmapped category encoded as 'A', so four of the busiest categories produced a code
    // that decoded to something else entirely. There is no safe stand-in for a category - a
    // wrong letter IS a wrong worksheet - so refuse to mint a code at all and say why.
    // Returning null (rather than throwing) keeps an inline onchange handler alive while making
    // the failure impossible to mistake for a code; every caller must treat null as "no code".
    const catCode = CATEGORY_CODES[category];
    if (!catCode) {
        console.error(`[settings-code] no settings-code symbol for category "${category}" - cannot generate a code.`);
        return null;
    }
    const skillCode = getSkillCode(category, skill);
    if (skillCode === null) {
        console.error(`[settings-code] skill "${skill}" is not encodable in category "${category}" - cannot generate a code.`);
        return null;
    }
    const rangeCode = RANGE_CODES[range] || '4';
    const decCode = DECIMAL_CODES[decimal] || '0';
    const timerCode = TIMER_CODES[timer] || '3';
    const diffCode = DIFFICULTY_CODES[difficulty] || 'M';

    // Format: CAT-SKILL-RANGE-DEC-TIMER-DIFF (e.g., A-03-4-0-3-M), then the picked skill's options
    // as an optional "~payload" (skill-option-codec.js). No options -> exactly the old 7 characters.
    const opts = optionSuffix(category, skill, getSetOptions(category, skill));
    return `${catCode}${skillCode}${rangeCode}${decCode}${timerCode}${diffCode}${opts}`;
}

// Update the displayed settings code and save settings
export function updateSettingsCode() {
    // Legacy function - now handled by updateSkillCodeDisplay
    saveSettings();
}

// Parse and apply a settings code (legacy + new format)
export function applySettingsCode() {
    const input = document.getElementById("settingsCodeInput");
    if (!input) return;

    const rawCode = (input.value || '').toUpperCase().trim();

    // Check if it's new skill code format (2-char codes with dashes). A part may now end in an
    // option payload ("EA~C78"); the old pattern is kept verbatim for codes without one, so every
    // code that routed here before still routes here and nothing else newly does.
    if (/^[A-Z0-9]{2,3}(-[A-Z0-9]{2,3})*$/i.test(rawCode) || isSkillCodeWithOptions(rawCode)) {
        // Redirect to new skill code system
        document.getElementById('studentCodeInput').value = rawCode;
        applySkillCode();
        input.value = '';
        return;
    }

    // Check if it's a compact mixed mode code (starts with M, at least 18 chars)
    if (rawCode.startsWith('M') && !rawCode.startsWith('MX-') && rawCode.length >= 18) {
        applyCompactMixedCode(rawCode, input);
        return;
    }

    // Check if it's old format mixed mode code (starts with MX-)
    if (rawCode.startsWith('MX-')) {
        applyMixedCode(rawCode, input);
        return;
    }

    // The picked skill's options ride after the 7 characters as "~payload"; split them off before
    // the old clean-up, which would otherwise glue the payload onto the code.
    const { head: settingsHead, payload: settingsOpts } = splitOptionSuffix(rawCode);
    const code = settingsHead.replace(/[^A-Z0-9]/g, '');

    if (code.length < 7) {
        showCodeError("Code too short. Need 7 characters.");
        return;
    }

    // Applying a code is all-or-nothing. A code that fails half way used to leave the picker on
    // the new category with whatever skill the dropdown defaulted to - which is the "silently
    // wrong worksheet" this rewrite is about, just with a red border next to it. Snapshot the
    // three selects and put them back if anything throws.
    const picker = {
        domain: document.getElementById("domainSelect")?.value,
        category: document.getElementById("categorySelect")?.value,
        skill: document.getElementById("skillSelect")?.value
    };
    const restorePicker = () => {
        const d = document.getElementById("domainSelect");
        const c = document.getElementById("categorySelect");
        const s = document.getElementById("skillSelect");
        if (d && picker.domain !== undefined) { d.value = picker.domain; updateCategoryOptions(); }
        if (c && picker.category !== undefined) { c.value = picker.category; updateSkillOptions(); }
        if (s && picker.skill !== undefined) s.value = picker.skill;
    };

    try {
        // Parse code: CAT(1) + SKILL(2) + RANGE(1) + DEC(1) + TIMER(1) + DIFF(1) = 7 chars
        const catCode = code[0];
        const skillCode = code.substring(1, 3);
        const rangeCode = code[3];
        const decCode = code[4];
        const timerCode = code[5];
        const diffCode = code[6];

        // Validate and apply category
        const category = CODE_TO_CATEGORY[catCode];
        if (!category) throw new Error(`Unknown category letter "${catCode}"`);
        if (!selectCategoryInPicker(category)) throw new Error(`Cannot open category "${category}"`);

        // Update skill options for the category, then set skill.
        //
        // getSkillFromCode decodes by POSITION, so it can hand back a retired id — that is the
        // whole point of keeping tombstones in place, and a code printed before a merge still
        // decodes to the id it was written with. But the picker no longer lists retired ids, so
        // assigning one straight to the select silently leaves it on selectedIndex -1 and the
        // teacher's saved settings code opens nothing. Hop the alias first so the code lands on
        // the surviving skill.
        //
        // mergedSkillFor, NOT resolveSkill: resolveSkill is the GENERATOR's resolver and, after
        // hopping to the survivor, routes the chosen Support level back to the legacy branch that
        // draws it — which is the retired id again, and still not in the dropdown. A picker wants
        // the hop without the variant routing.
        //
        // strict:true here. A settings code carries ONE skill, so an index past the end of the
        // category is a broken code, not a skill; the lenient fallback used to answer with the
        // category's first skill and hand the teacher a worksheet they never asked for.
        updateSkillOptions();
        const decoded = getSkillFromCode(category, skillCode, { strict: true });
        if (decoded === null) throw new Error(`No skill ${skillCode} in "${category}"`);
        const resolved = mergedSkillFor(category, decoded);
        const skillSelect = document.getElementById("skillSelect");
        if (resolved.categoryId !== category) {
            // An alias may hop categories; follow it or the select below finds nothing.
            if (!selectCategoryInPicker(resolved.categoryId)) throw new Error(`Cannot open category "${resolved.categoryId}"`);
            updateSkillOptions();
        }
        skillSelect.value = resolved.skillId;
        if (skillSelect.selectedIndex === -1) skillSelect.value = decoded;   // last resort: the raw id
        if (skillSelect.selectedIndex === -1) throw new Error(`Skill "${decoded}" is not available`);

        // The code's options belong to the skill it names; plain play of the picked skill reads
        // them through the per-skill lookup in generate-question.js. A code without them resets
        // the skill to its defaults, so a previous code's choice cannot linger.
        const pickedCat = resolved.categoryId;
        const pickedSkill = skillSelect.value;
        const pickedOpts = { ...(resolved.opts || {}), ...decodeOptionPayload(pickedCat, pickedSkill, settingsOpts) };
        if (Object.keys(pickedOpts).length) setSetOptions(pickedCat, pickedSkill, pickedOpts);
        else deleteSetOptions(pickedCat, pickedSkill);

        // Apply range
        const range = CODE_TO_RANGE[rangeCode];
        const rangeSelect = document.getElementById("rangeSelect");
        if (range && rangeSelect) rangeSelect.value = range;

        // Apply decimals
        const dec = CODE_TO_DECIMAL[decCode];
        const decimalSelect = document.getElementById("decimalSelect");
        if (dec !== undefined && decimalSelect) decimalSelect.value = dec;

        // Apply timer
        const timer = CODE_TO_TIMER[timerCode];
        const timerSelect = document.getElementById("timerSelect");
        if (timer && timerSelect) timerSelect.value = timer;

        // Parse difficulty code for backward compat (but don't apply - always medium)

        // Update visibility and code display
        updateNumberSectionVisibility();
        updateSettingsCode();

        // Show success feedback
        input.style.borderColor = "var(--correct)";
        input.style.background = "rgba(6,214,160,0.2)";
        setTimeout(() => {
            input.style.borderColor = "var(--accent-orange)";
            input.style.background = "var(--bg-card-light)";
            input.value = '';
        }, 1500);

    } catch (e) {
        restorePicker();
        // Say WHICH part of the code failed. The old blanket "Invalid code format" was how a
        // teacher's broken code looked exactly like a typo, and it hid the dead-letter bug for
        // as long as it did.
        showCodeError(e && e.message ? e.message : "Invalid code format");
    }
}

/**
 * The optional problem goals an MX- settings part carries after its 5 settings characters:
 * TT (total problems, 00 = off) and CC (correct goal, 00 = off), exactly as the compact M code
 * writes them. A 5-character settings part (every MX code before 2026-09-24) has no goals.
 */
export function parseMixedGoals(settingsPart) {
    const g = String(settingsPart || '').slice(5, 9);
    if (!/^\d{4}$/.test(g)) return {};
    const totalProblems = parseInt(g.slice(0, 2), 10) || 0;
    const correctGoal = parseInt(g.slice(2, 4), 10) || 0;
    return {
        totalProblemsEnabled: totalProblems > 0,
        totalProblems: totalProblems > 0 ? totalProblems : null,
        correctGoalEnabled: correctGoal > 0,
        correctGoal: correctGoal > 0 ? correctGoal : null,
    };
}

/**
 * Write an MX- mixed code for a list of skills, each with its own options:
 *
 *     MX-<skill>.<skill>...-<range><dec><diff><timer><mode>[<TT><CC>]
 *     skill = <category letter><2-digit position>[~<options>]
 *
 * e.g. MX-T00~C78.A00-40MSS2000 — mult_facts (7s and 8s) and add_facts, 20 problems.
 * Positions are the frozen positional indices (getPositionalSkills), so a code never moves.
 * A skill whose category has no settings-code letter, or whose position no longer fits, is left
 * out and reported in `skipped` rather than written as a different skill.
 */
export function buildMixedCode({ skills = [], range = 100, decimals = 0, timer = 'S', mode = 'S', totalProblems = 0, correctGoal = 0 } = {}) {
    const parts = [];
    const skipped = [];
    for (const sk of skills) {
        const letter = CATEGORY_CODES[sk.categoryId];
        const idx = letter ? getSkillCode(sk.categoryId, sk.skillId) : null;
        if (!letter || idx === null) { skipped.push(`${sk.categoryId}:${sk.skillId}`); continue; }
        const opts = sk.opts !== undefined ? sk.opts : getSetOptions(sk.categoryId, sk.skillId);
        parts.push(letter + idx + optionSuffix(sk.categoryId, sk.skillId, opts));
    }
    if (!parts.length) return { code: '', skipped };
    const MODE_LETTER = { practice: 'P', timed: 'T', race: 'R', boss: 'B', worksheet: 'W' };
    const rangeCode = RANGE_CODES[String(range)] || '4';
    const decCode = DECIMAL_CODES[String(decimals)] || '0';
    const timerCode = timer === 'S' || timer === null || timer === undefined ? 'S' : (TIMER_CODES[String(timer)] || '0');
    const modeCode = mode === 'S' || !mode ? 'S' : (MODE_LETTER[mode] || 'P');
    const tp = Math.max(0, Math.min(99, parseInt(totalProblems, 10) || 0));
    const cg = Math.max(0, Math.min(99, parseInt(correctGoal, 10) || 0));
    const goals = (tp || cg) ? String(tp).padStart(2, '0') + String(cg).padStart(2, '0') : '';
    return { code: `MX-${parts.join('.')}-${rangeCode}${decCode}M${timerCode}${modeCode}${goals}`, skipped };
}

// Parse and apply a mixed mode code (MX-...)
export function applyMixedCode(code, input) {
    try {
        // Format: MX-[skillcodes]-[range][dec][diff][time][mode]
        // Example: MX-A00.A01.B02-40MSP
        const parts = code.split('-');
        if (parts.length < 3) throw new Error("Invalid format");

        const skillsPart = parts[1];
        const settingsPart = parts[2];

        // Parse skills (A00.A01.B02...)
        const skillCodes = skillsPart.split('.');
        const selectedSkills = {};

        const MODE_LETTER_REVERSE = { 'P': 'practice', 'T': 'timed', 'R': 'race', 'B': 'boss', 'W': 'worksheet' };

        // A skill part may carry "~options" (skill-option-codec.js): "T00~C78".
        const skillOptions = {};
        skillCodes.forEach(rawSc => {
            const { head: sc, payload } = splitOptionSuffix(rawSc);
            if (sc.length >= 3) {
                const catLetter = sc[0];
                const skillIdx = parseInt(sc.substring(1), 10);
                const category = CODE_TO_CATEGORY[catLetter];

                const positional = category && SKILLS[category] ? getPositionalSkills(category) : [];
                if (positional[skillIdx]) {
                    if (!selectedSkills[category]) selectedSkills[category] = [];
                    selectedSkills[category].push(positional[skillIdx].v);
                    const opts = payload ? decodeOptionPayload(category, positional[skillIdx].v, payload) : {};
                    if (Object.keys(opts).length) skillOptions[`${category}:${positional[skillIdx].v}`] = opts;
                }
            }
        });

        // Parse settings: [range][dec][diff][time][mode]
        const rangeCode = settingsPart[0];
        const decCode = settingsPart[1];
        const diffCode = settingsPart[2];
        const timerCode = settingsPart[3];
        const modeCode = settingsPart[4];

        const range = CODE_TO_RANGE[rangeCode] || '100';
        const decimal = CODE_TO_DECIMAL[decCode] || '0';
        const difficulty = CODE_TO_DIFFICULTY[diffCode] || 'medium';
        const timerChoice = timerCode === 'S' ? 'student' : 'teacher';
        const timer = timerCode !== 'S' ? (CODE_TO_TIMER[timerCode] || '0') : null;
        const modeChoice = modeCode === 'S' ? 'student' : 'teacher';
        const mode = modeCode !== 'S' ? (MODE_LETTER_REVERSE[modeCode] || 'practice') : null;

        // Validate skills were parsed
        if (Object.keys(selectedSkills).length === 0) {
            throw new Error("No valid skills found");
        }

        // Problem goals: optional 4 more characters after the 5 settings (MX codes written since
        // 2026-09-24 carry them; an older 5-character settings part has none).
        const goals = parseMixedGoals(settingsPart);

        // Apply mixed settings
        state.mixedModeSettings = {
            selectedSkills: selectedSkills,
            range: parseInt(range, 10),
            decimalPlaces: parseInt(decimal, 10),
            difficulty: difficulty,
            timeChoice: timerChoice,
            modeChoice: modeChoice,
            timer: timer ? parseInt(timer, 10) : null,
            mode: mode,
            ...goals,
            skillOptions,
        };
        restoreSetOptions(skillOptions, { replace: true });

        state.category = 'all_mixed';
        state.skill = 'custom_mixed';
        state.range = state.mixedModeSettings.range;
        state.decimalPlaces = state.mixedModeSettings.decimalPlaces;

        // Update UI with null checks
        const categorySelect = document.getElementById('categorySelect');
        const rangeSelect = document.getElementById('rangeSelect');
        const decimalSelect = document.getElementById('decimalSelect');

        if (categorySelect) categorySelect.value = 'all_mixed';
        if (rangeSelect) rangeSelect.value = state.range;
        if (decimalSelect) decimalSelect.value = state.decimalPlaces;

        // Show the custom mixed skill and ensure value is set
        const skillSelect = document.getElementById('skillSelect');
        if (skillSelect) {
            skillSelect.innerHTML = '<option value="custom_mixed" selected>🎲 Custom Mixed (Code Applied)</option>';
            skillSelect.value = 'custom_mixed';
        }

        // Save mixed mode settings to cookie for Play Mixed button
        saveMixedModeSettings();

        // Grey out mode cards if teacher set the mode
        updateModeCardsState();

        // Count skills for feedback
        const totalSkills = Object.values(selectedSkills).reduce((sum, arr) => sum + arr.length, 0);

        // Show success feedback
        input.style.borderColor = "var(--correct)";
        input.style.background = "rgba(6,214,160,0.2)";
        input.value = `✓ ${totalSkills} skills loaded!`;
        setTimeout(() => {
            input.style.borderColor = "var(--accent-orange)";
            input.style.background = "var(--bg-card-light)";
            input.value = '';
        }, 2000);

    } catch (e) {
        console.error("Mixed code error:", e);
        showCodeError("Invalid mixed code");
    }
}

// Parse and apply compact mixed mode code (M + skill chars + 5 setting chars)
export function applyCompactMixedCode(code, input) {
    try {
        // Format: M[skill chars][5-char settings][4-char goals]
        // Skills: 2 chars per category (6 categories) = 12+ chars (base36 encoded bitfields)
        // Settings: range(1) + decimal(1) + difficulty(1) + timer(1) + mode(1) = 5 chars
        // Goals: totalProblems(2) + correctGoal(2) = 4 chars (optional, for backwards compatibility)

        const MODE_LETTER_REVERSE = { 'P': 'practice', 'T': 'timed', 'R': 'race', 'B': 'boss', 'W': 'worksheet' };

        // Check if code has goals (22+ chars) or is old format (18 chars)
        const hasGoals = code.length >= 22;

        let settingsPart, skillPart, goalsPart;
        if (hasGoals) {
            goalsPart = code.slice(-4); // last 4 chars are goals
            settingsPart = code.slice(-9, -4); // 5 chars before goals
            skillPart = code.substring(1, code.length - 9); // everything between M and settings
        } else {
            goalsPart = '0000'; // no goals (backwards compatible)
            settingsPart = code.slice(-5); // last 5 chars are settings
            skillPart = code.substring(1, code.length - 5); // everything between M and settings
        }

        // Parse skills from bitfields
        const selectedSkills = {};
        CATEGORY_ORDER.forEach((cat, idx) => {
            const startPos = idx * 2;
            if (startPos + 2 <= skillPart.length) {
                const catBits = skillPart.substring(startPos, startPos + 2);
                const bitfield = parseInt(catBits, 36);
                const skills = bitfieldToSkills(cat, bitfield);
                if (skills.length > 0) {
                    selectedSkills[cat] = skills;
                }
            }
        });

        // Parse settings
        const rangeCode = settingsPart[0];
        const decCode = settingsPart[1];
        const diffCode = settingsPart[2];
        const timerCode = settingsPart[3];
        const modeCode = settingsPart[4];

        const range = CODE_TO_RANGE[rangeCode] || '100';
        const decimal = CODE_TO_DECIMAL[decCode] || '0';
        const difficulty = CODE_TO_DIFFICULTY[diffCode] || 'medium';
        const timerChoice = timerCode === 'S' ? 'student' : 'teacher';
        const timer = timerCode !== 'S' ? (CODE_TO_TIMER[timerCode] || '0') : null;
        const modeChoice = modeCode === 'S' ? 'student' : 'teacher';
        const mode = modeCode !== 'S' ? (MODE_LETTER_REVERSE[modeCode] || 'practice') : null;

        // Parse problem goals
        const totalProblems = parseInt(goalsPart.substring(0, 2), 10) || 0;
        const correctGoal = parseInt(goalsPart.substring(2, 4), 10) || 0;

        // Validate skills were parsed
        if (Object.keys(selectedSkills).length === 0) {
            throw new Error("No valid skills found");
        }

        // Apply mixed settings
        state.mixedModeSettings = {
            selectedSkills: selectedSkills,
            range: parseInt(range, 10),
            decimalPlaces: parseInt(decimal, 10),
            difficulty: difficulty,
            timeChoice: timerChoice,
            modeChoice: modeChoice,
            timer: timer ? parseInt(timer, 10) : null,
            mode: mode,
            // Problem goals
            totalProblemsEnabled: totalProblems > 0,
            totalProblems: totalProblems > 0 ? totalProblems : null,
            correctGoalEnabled: correctGoal > 0,
            correctGoal: correctGoal > 0 ? correctGoal : null
        };

        state.category = 'all_mixed';
        state.skill = 'custom_mixed';
        state.range = state.mixedModeSettings.range;
        state.decimalPlaces = state.mixedModeSettings.decimalPlaces;

        // Update UI with null checks
        const rangeSelect = document.getElementById('rangeSelect');
        const decimalSelect = document.getElementById('decimalSelect');

        if (rangeSelect) rangeSelect.value = state.range;
        if (decimalSelect) decimalSelect.value = state.decimalPlaces;

        // Show the custom mixed skill in dropdown and ensure value is set
        const skillSelect = document.getElementById('skillSelect');
        if (skillSelect) {
            skillSelect.innerHTML = '<option value="custom_mixed" selected>🎲 Custom Mixed (Code Applied)</option>';
            skillSelect.value = 'custom_mixed';
        }

        // Save mixed mode settings to cookie for Play Mixed button
        saveMixedModeSettings();

        // Grey out mode cards if teacher set the mode
        updateModeCardsState();

        // Count skills for feedback
        const totalSkills = Object.values(selectedSkills).reduce((sum, arr) => sum + arr.length, 0);

        // Show success feedback
        input.style.borderColor = "var(--correct)";
        input.style.background = "rgba(6,214,160,0.2)";
        input.value = `✓ ${totalSkills} skills loaded!`;
        setTimeout(() => {
            input.style.borderColor = "var(--accent-orange)";
            input.style.background = "var(--bg-card-light)";
            input.value = '';
        }, 2000);

        // If teacher set the mode, grey out other modes but don't auto-start
        // User will click Start Game button

    } catch (e) {
        console.error("Compact mixed code error:", e);
        showCodeError("Invalid code format");
    }
}

// Update mode cards state based on mixed mode settings
export function updateModeCardsState() {
    const modeCards = document.querySelectorAll('.mode-card:not(.mixed-mode-card)');

    if (state.mixedModeSettings && state.mixedModeSettings.modeChoice === 'teacher' && state.mixedModeSettings.mode) {
        // Grey out all modes except the teacher-selected one
        const teacherMode = state.mixedModeSettings.mode;
        modeCards.forEach(card => {
            const cardMode = card.dataset.mode;
            if (cardMode !== teacherMode) {
                card.classList.add('mode-disabled');
                card.style.opacity = '0.4';
                card.style.pointerEvents = 'none';
            } else {
                card.classList.remove('mode-disabled');
                card.classList.add('selected');
                card.style.opacity = '1';
                card.style.pointerEvents = 'auto';
            }
        });
    } else {
        // Enable all modes
        modeCards.forEach(card => {
            card.classList.remove('mode-disabled');
            card.style.opacity = '1';
            card.style.pointerEvents = 'auto';
        });
    }
}

// Reset mixed mode and enable all mode cards
export function resetMixedMode() {
    state.mixedModeSettings = null;
    state.category = 'operations';
    state.skill = 'add';

    // Reset UI
    document.getElementById('categorySelect').value = 'operations';
    updateSkillOptions();
    updateModeCardsState();

    // Show feedback
    const modeCards = document.querySelectorAll('.mode-card');
    modeCards.forEach(card => card.classList.remove('selected'));
    document.querySelector('.mode-card[data-mode="practice"]').classList.add('selected');
}

// ===== ENHANCED SHARING SYSTEM =====

export function generateEnhancedSkillCode() {
    // Reuse existing skill code generation for the skills part
    const skillsPart = generateSkillCode();
    if (!skillsPart || skillsPart === '---') return '';

    // Build settings part from share settings
    const ss = state.shareSettings || {};
    const tokens = [];

    // Timer
    if (ss.timer !== undefined && ss.timer !== '?') tokens.push('T' + ss.timer);
    // Problem count
    if (ss.problemCount !== undefined && ss.problemCount !== '?') tokens.push('N' + ss.problemCount);
    // Game mode
    if (ss.gameMode && ss.gameMode !== '?') {
        const modeMap = { practice: 'p', boss: 'b', race: 'r', worksheet: 'w' };
        tokens.push('G' + (modeMap[ss.gameMode] || 'p'));
    }
    // Range
    if (ss.range !== undefined && ss.range !== '?') tokens.push('R' + ss.range);
    // Decimals
    if (ss.decimals !== undefined && ss.decimals !== '?') tokens.push('D' + ss.decimals);
    // Whole-Program Adaptive Mode (A1 = ON; omitted = OFF, matches default-false convention)
    if (state.adaptiveModeEnabled === true) {
        tokens.push('A1');
    }
    // Quick Start lock
    if (state.shareSettings && state.shareSettings.quickStartLocked === 'locked') {
        tokens.push('Q1');
    }
    // Help after a wrong answer (support-ladder.js): H1 worked example only, H0 none; the
    // default ladder writes nothing, so every existing link is unchanged. An old app skips it.
    if (typeof window !== 'undefined' && typeof window.helpMode === 'function') {
        const hm = window.helpMode();
        if (hm === 'worked') tokens.push('H1');
        else if (hm === 'none') tokens.push('H0');
    }

    if (tokens.length === 0) return skillsPart;
    return skillsPart + '|' + tokens.join('-');
}

export function parseEnhancedSkillCode(code) {
    const result = { skills: [], settings: {} };

    // Split on pipe
    const parts = code.split('|');
    const skillsCode = parts[0];
    const settingsStr = parts.length > 1 ? parts[1] : '';

    // Store raw skills code for later parsing via applySkillCode
    result.skillsCode = skillsCode;

    // Parse settings tokens
    if (settingsStr) {
        const tokens = settingsStr.split('-');
        for (const token of tokens) {
            if (!token) continue;
            const key = token[0];
            const val = token.substring(1);
            switch (key) {
                case 'T':
                    result.settings.timer = val === '?' ? '?' : parseInt(val, 10);
                    break;
                case 'N':
                    result.settings.problemCount = val === '?' ? '?' : parseInt(val, 10);
                    break;
                case 'G': {
                    const modeMap = { p: 'practice', b: 'boss', r: 'race', w: 'worksheet' };
                    result.settings.gameMode = val === '?' ? '?' : (modeMap[val] || 'practice');
                    break;
                }
                case 'R':
                    result.settings.range = val === '?' ? '?' : parseInt(val, 10);
                    break;
                case 'D':
                    result.settings.decimals = val === '?' ? '?' : parseInt(val, 10);
                    break;
                case 'Q':
                    result.settings.quickStartLocked = val === '1' ? 'locked' : '?';
                    break;
                case 'A':
                    result.settings.adaptive = (val === '1');
                    break;
                case 'H':
                    // help after a wrong answer (support-ladder.js)
                    result.settings.help = val === '1' ? 'worked' : val === '0' ? 'none' : 'ladder';
                    break;
            }
        }
    }

    return result;
}

export function generateQuickStartLink() {
    const skillsPart = generateSkillCode();
    if (!skillsPart || skillsPart === '---') {
        if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Add skills first!', 'warning');
        }
        return '';
    }
    // Build settings suffix (Q1 = QS-lock, A1 = adaptive ON). Both flags
    // default to OFF; omit them entirely when off so old links keep working.
    const suffixTokens = [];
    if (state.adaptiveModeEnabled === true) suffixTokens.push('A1');
    if (state.shareSettings && state.shareSettings.quickStartLocked === 'locked') suffixTokens.push('Q1');
    const lockSuffix = suffixTokens.length ? ('|' + suffixTokens.join('-')) : '';
    const PRODUCTION_URL = 'https://math.cultivatingthedigital.org/';
    const link = PRODUCTION_URL + '?qs=' + encodeURIComponent(skillsPart + lockSuffix);

    const linkField = document.getElementById('shareableLinkField');
    if (linkField) linkField.value = link;

    return link;
}

export function setShareLinkType(type) {
    state.shareLinkType = type;

    // Toggle active button
    const directBtn = document.getElementById('shareLinkTypeDirect');
    const qsBtn = document.getElementById('shareLinkTypeQS');
    if (directBtn) directBtn.classList.toggle('active', type === 'direct');
    if (qsBtn) qsBtn.classList.toggle('active', type === 'quickstart');

    // Toggle settings grid vs info text
    const settingsGrid = document.getElementById('shareSettingsDirectOnly');
    const qsInfo = document.getElementById('shareQuickStartInfo');
    if (settingsGrid) settingsGrid.style.display = type === 'direct' ? '' : 'none';
    if (qsInfo) qsInfo.style.display = type === 'quickstart' ? 'block' : 'none';

    // Clear link field
    const linkField = document.getElementById('shareableLinkField');
    if (linkField) linkField.value = '';
}

export function generateShareableLink() {
    // Check link type
    if (state.shareLinkType === 'quickstart') {
        return generateQuickStartLink();
    }

    const code = generateEnhancedSkillCode();
    if (!code) {
        if (typeof window !== 'undefined' && window.showToast) {
            window.showToast('Add skills first!', 'warning');
        }
        return '';
    }
    const PRODUCTION_URL = 'https://math.cultivatingthedigital.org/';
    const link = PRODUCTION_URL + '?c=' + encodeURIComponent(code);

    const linkField = document.getElementById('shareableLinkField');
    if (linkField) linkField.value = link;

    return link;
}

export function copyShareableLink() {
    const linkField = document.getElementById('shareableLinkField');
    if (!linkField || !linkField.value) {
        generateShareableLink();
    }
    const link = linkField ? linkField.value : '';
    if (link) {
        const flashCopyBtn = () => {
            const btn = document.getElementById('copyLinkBtn');
            if (btn) {
                btn.textContent = 'Copied!';
                btn.style.background = '#06D6A0';
                btn.style.color = '#fff';
                btn.style.borderColor = '#06D6A0';
                setTimeout(() => {
                    btn.textContent = 'Copy';
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.borderColor = '';
                }, 1500);
            }
        };
        navigator.clipboard.writeText(link).then(() => {
            flashCopyBtn();
        }).catch(() => {
            if (linkField) {
                linkField.select();
                document.execCommand('copy');
            }
            flashCopyBtn();
        });
    }
}

export function updateShareSettings(field, value) {
    if (!state.shareSettings) {
        state.shareSettings = { timer: '?', problemCount: '?', gameMode: '?', range: '?', decimals: '?' };
    }
    state.shareSettings[field] = value;
    generateShareableLink();
}

export function showCodeError(msg) {
    const input = document.getElementById("settingsCodeInput");
    input.style.borderColor = "var(--incorrect)";
    input.style.background = "rgba(239,71,111,0.2)";
    input.placeholder = msg;
    setTimeout(() => {
        input.style.borderColor = "var(--accent-orange)";
        input.style.background = "var(--bg-card-light)";
        input.placeholder = "Enter code";
    }, 2000);
}

