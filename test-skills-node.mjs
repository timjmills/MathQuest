// Node.js test script for MathQuest skill generation
// Run with: node test-skills-node.mjs

// ============ Minimal DOM stubs ============
const elementProto = {
    setAttribute() {},
    getAttribute() { return ''; },
    appendChild(child) { return child; },
    removeChild(child) { return child; },
    addEventListener() {},
    removeEventListener() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
    getElementsByClassName() { return []; },
    getElementsByTagName() { return []; },
    insertAdjacentHTML() {},
    closest() { return null; },
    contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 100, height: 100, right: 100, bottom: 100 }; },
    focus() {},
    blur() {},
    click() {},
    remove() {},
    cloneNode() { return createElement('div'); },
    get children() { return []; },
    get childNodes() { return []; },
    get firstChild() { return null; },
    get lastChild() { return null; },
    get nextSibling() { return null; },
    get previousSibling() { return null; },
    get parentNode() { return null; },
    get parentElement() { return null; },
    get offsetWidth() { return 100; },
    get offsetHeight() { return 100; },
    get scrollWidth() { return 100; },
    get scrollHeight() { return 100; },
    get clientWidth() { return 100; },
    get clientHeight() { return 100; },
};

function createElement(tag) {
    const el = Object.create(elementProto);
    el.tagName = (tag || 'div').toUpperCase();
    el.style = new Proxy({}, { get: () => '', set: () => true });
    el.classList = {
        add() {}, remove() {}, toggle() {}, contains() { return false; },
        _classes: new Set(),
    };
    el.dataset = {};
    el.innerHTML = '';
    el.textContent = '';
    el.innerText = '';
    el.value = '';
    el.checked = false;
    el.disabled = false;
    el.id = '';
    el.className = '';
    el.type = '';
    el.href = '';
    el.src = '';
    el.name = '';
    el.selectedIndex = 0;
    el.options = [];
    el.selectedOptions = [{ text: 'Addition', value: 'addition' }];
    return el;
}

// Document stub
const doc = {
    createElement,
    createElementNS(ns, tag) { return createElement(tag); },
    createTextNode(text) { return { textContent: text, nodeType: 3 }; },
    createDocumentFragment() { return createElement('fragment'); },
    getElementById(id) {
        const el = createElement('div');
        el.id = id;
        // Provide reasonable defaults for select elements
        if (id === 'categorySelect') {
            el.value = 'addition';
            el.selectedOptions = [{ text: 'Addition', value: 'addition' }];
        }
        if (id === 'skillSelect') {
            el.value = 'add';
        }
        if (id === 'timerSelect') el.value = '0';
        if (id === 'problemCountSelect') el.value = '20';
        if (id === 'maxRangeSelect') el.value = '100';
        if (id === 'decimalSelect') el.value = '0';
        return el;
    },
    querySelector() { return createElement('div'); },
    querySelectorAll() { return []; },
    getElementsByClassName() { return []; },
    getElementsByTagName() { return []; },
    body: createElement('body'),
    head: createElement('head'),
    documentElement: createElement('html'),
    cookie: '',
    readyState: 'complete',
    addEventListener() {},
    removeEventListener() {},
    createRange() {
        return {
            selectNodeContents() {},
            collapse() {},
            setStart() {},
            setEnd() {},
        };
    },
};

// Window stub
const win = {
    document: doc,
    location: { href: 'http://localhost/', search: '', pathname: '/', origin: 'http://localhost', hash: '' },
    navigator: { userAgent: 'node-test', clipboard: { writeText() { return Promise.resolve(); } } },
    localStorage: {
        _data: {},
        getItem(key) { return this._data[key] || null; },
        setItem(key, val) { this._data[key] = String(val); },
        removeItem(key) { delete this._data[key]; },
    },
    sessionStorage: {
        _data: {},
        getItem(key) { return this._data[key] || null; },
        setItem(key, val) { this._data[key] = String(val); },
        removeItem(key) { delete this._data[key]; },
    },
    setTimeout(fn, ms) { return setTimeout(fn, ms); },
    clearTimeout(id) { clearTimeout(id); },
    setInterval(fn, ms) { return setInterval(fn, ms); },
    clearInterval(id) { clearInterval(id); },
    requestAnimationFrame(fn) { return setTimeout(fn, 16); },
    cancelAnimationFrame(id) { clearTimeout(id); },
    innerWidth: 1024,
    innerHeight: 768,
    scrollTo() {},
    getComputedStyle() {
        return new Proxy({}, { get: () => '' });
    },
    matchMedia() {
        return { matches: false, addEventListener() {}, removeEventListener() {} };
    },
    addEventListener() {},
    removeEventListener() {},
    open() {},
    close() {},
    URL: globalThis.URL,
    Blob: globalThis.Blob || class Blob { constructor() {} },
    speechSynthesis: { speak() {}, cancel() {}, speaking: false, getVoices() { return []; } },
    SpeechSynthesisUtterance: class { constructor() { this.text = ''; } },
    MutationObserver: class { constructor() {} observe() {} disconnect() {} },
    ResizeObserver: class { constructor() {} observe() {} disconnect() {} },
    IntersectionObserver: class { constructor() {} observe() {} disconnect() {} },
    DOMParser: class {
        parseFromString(str, type) { return doc; }
    },
    HTMLElement: class {},
    customElements: { define() {}, get() { return undefined; } },
    getSelection() { return { removeAllRanges() {}, addRange() {} }; },
    print() {},
    alert() {},
    confirm() { return true; },
    prompt() { return ''; },
    // Shared arrays
    skillQueue: [],
    customQuickSkills: [],
    globalSkillsList: [],
    weightedItems: [],
    mixedSkillsList: [],
    selectedDivisors: [2, 3, 4, 5, 6, 7, 8, 9],
};

// Apply to globalThis (use Object.defineProperty for read-only props)
const propsToSet = {
    window: win,
    document: doc,
    localStorage: win.localStorage,
    sessionStorage: win.sessionStorage,
    HTMLElement: win.HTMLElement,
    MutationObserver: win.MutationObserver,
    ResizeObserver: win.ResizeObserver,
    IntersectionObserver: win.IntersectionObserver,
    DOMParser: win.DOMParser,
    getComputedStyle: win.getComputedStyle,
    matchMedia: win.matchMedia,
    requestAnimationFrame: win.requestAnimationFrame,
    cancelAnimationFrame: win.cancelAnimationFrame,
    speechSynthesis: win.speechSynthesis,
    SpeechSynthesisUtterance: win.SpeechSynthesisUtterance,
    alert: win.alert,
    confirm: win.confirm,
    customElements: win.customElements,
    self: win,
    top: win,
    parent: win,
};

for (const [key, val] of Object.entries(propsToSet)) {
    try {
        globalThis[key] = val;
    } catch {
        try {
            Object.defineProperty(globalThis, key, { value: val, writable: true, configurable: true });
        } catch {
            // Some props truly cannot be overridden (e.g. navigator), skip
        }
    }
}

// navigator is getter-only in Node, need special handling
try {
    Object.defineProperty(globalThis, 'navigator', { value: win.navigator, writable: true, configurable: true });
} catch { /* ignore */ }

try {
    Object.defineProperty(globalThis, 'location', { value: win.location, writable: true, configurable: true });
} catch { /* ignore */ }

// Make window properties accessible from globalThis
for (const key of Object.keys(win)) {
    if (!(key in globalThis)) {
        try { globalThis[key] = win[key]; } catch {}
    }
}

// ============ Import and Test ============

// Suppress console.log noise during testing
const originalLog = console.log;
const originalWarn = console.warn;
let suppressLogs = true;
console.log = (...args) => { if (!suppressLogs) originalLog(...args); };
console.warn = (...args) => { if (!suppressLogs) originalWarn(...args); };

// Import modules
let state, SKILLS, generateQuestion;
try {
    const stateModule = await import('./js/modules/state.js');
    state = stateModule.state;

    const dataModule = await import('./js/modules/data.js');
    SKILLS = dataModule.SKILLS;

    const genModule = await import('./js/modules/generate-question.js');
    generateQuestion = genModule.generateQuestion;

    // Also set up window functions that generators may need
    globalThis.window.getSkillLabelForQuestion = function(skill, cat) { return skill; };
    globalThis.window.showToast = function() {};

    originalLog('\x1b[36m=== MathQuest Skill Test Runner ===\x1b[0m\n');
} catch (err) {
    originalLog('\x1b[31mFailed to import modules:\x1b[0m', err.message);
    originalLog(err.stack);
    process.exit(1);
}

// Meta/mixed skills to skip
const metaSkills = new Set([
    'mixed', 'mixed_addition', 'mixed_subtraction', 'mixed_multiplication', 'mixed_division',
    'mixed_integers', 'mixed_fractions', 'mixed_decimals', 'mixed_conversions',
    'operations_all', 'mixed_area_perimeter', 'mixed_angles_lines', 'mixed_shapes',
    'mixed_coordinates', 'mixed_measurement', 'mixed_time', 'geometry_all', 'measurement_all',
    'geo_meas_all', 'mixed_graphs', 'mixed_data_analysis', 'mixed_probability', 'data_stats_all',
    'mixed_patterns', 'mixed_algebra', 'mixed_order_ops', 'mixed_placevalue',
    'mixed_number_sense', 'mixed_number_theory', 'patterns_all', 'algebra_all', 'order_ops_all',
    'placevalue_all', 'number_sense_all', 'number_theory_all', 'algebraic_all',
    'fractions_all', 'decimals_all', 'conversions_all', 'fdp_all',
    'all_domains_mixed', 'custom_mixed',
    'mixed_add_sub', 'mixed_mult_div',
    'mixed_fraction_ops', 'mixed_shapes_early',
    'counting_all', 'mixed_counting', 'mixed_comparing', 'mixed_composing',
]);

const RUNS_PER_SKILL = 5;

function resetState() {
    state.category = "operations";
    state.skill = "add";
    state.difficulty = "medium";
    state.range = 100;
    state.decimalPlaces = 0;
    state.selectedNumbers = Array.from({ length: 12 }, (_, i) => i + 1);
    state.gameMode = "practice";
    state.isMixedMode = false;
    state.mixedModeSettings = null;
    state.hasAnswered = false;
    state.qCount = 0;
    state.score = 0;
    state.currentQ = null;
}

function validateQuestion(q) {
    const issues = [];
    if (!q.text || (typeof q.text === 'string' && q.text.trim() === '')) {
        issues.push('Empty q.text');
    }
    if (q.ans === undefined || q.ans === null) {
        issues.push('q.ans is undefined/null');
    }
    if (q.text === "10 + 10 = ?" && q.ans === 20) {
        issues.push('Got default fallback question (unhandled skill)');
    }
    if (typeof q.ans === 'number' && isNaN(q.ans)) {
        issues.push('q.ans is NaN');
    }
    if (typeof q.text === 'string') {
        if (q.text.includes('undefined')) issues.push('q.text contains "undefined"');
        if (q.text.includes('NaN')) issues.push('q.text contains "NaN"');
    }
    if (typeof q.ans === 'string') {
        if (q.ans.includes('undefined')) issues.push('q.ans contains "undefined"');
        if (q.ans.includes('NaN')) issues.push('q.ans contains "NaN"');
    }
    return issues;
}

// Collect all individual skills
const skillsToTest = [];
for (const [categoryId, skills] of Object.entries(SKILLS)) {
    if (!Array.isArray(skills)) continue;
    for (const skill of skills) {
        if (metaSkills.has(skill.v)) continue;
        skillsToTest.push({ categoryId, skillId: skill.v, label: skill.l });
    }
}

originalLog(`Testing ${skillsToTest.length} individual skills (${RUNS_PER_SKILL} runs each)\n`);

let passCount = 0;
let failCount = 0;
let partialCount = 0;
const failedSkills = [];

for (const { categoryId, skillId, label } of skillsToTest) {
    let successRuns = 0;
    const errors = [];

    for (let i = 0; i < RUNS_PER_SKILL; i++) {
        try {
            resetState();
            state.category = categoryId;
            state.skill = skillId;
            const q = generateQuestion();
            const issues = validateQuestion(q);
            if (issues.length === 0) {
                successRuns++;
            } else {
                errors.push(`Run ${i+1}: ${issues.join(', ')} | text="${(q.text||'').substring(0,60)}" ans=${q.ans}`);
            }
        } catch (err) {
            errors.push(`Run ${i+1}: EXCEPTION: ${err.message}`);
        }
    }

    if (successRuns === RUNS_PER_SKILL) {
        passCount++;
        // Show passing as dot
        process.stdout.write('\x1b[32m.\x1b[0m');
    } else if (successRuns === 0) {
        failCount++;
        failedSkills.push({ categoryId, skillId, label, successRuns, errors });
        process.stdout.write('\x1b[31mF\x1b[0m');
    } else {
        partialCount++;
        failedSkills.push({ categoryId, skillId, label, successRuns, errors });
        process.stdout.write('\x1b[33mP\x1b[0m');
    }
}

originalLog('\n');

// Summary
originalLog('\n\x1b[36m=== SUMMARY ===\x1b[0m');
originalLog(`\x1b[32m  Passed:  ${passCount}\x1b[0m`);
originalLog(`\x1b[31m  Failed:  ${failCount}\x1b[0m`);
originalLog(`\x1b[33m  Partial: ${partialCount}\x1b[0m`);
originalLog(`  Total:   ${skillsToTest.length} skills (${skillsToTest.length * RUNS_PER_SKILL} runs)\n`);

if (failedSkills.length > 0) {
    originalLog('\x1b[31m=== FAILURES ===\x1b[0m\n');
    for (const f of failedSkills) {
        const status = f.successRuns === 0 ? '\x1b[31mFAIL\x1b[0m' : `\x1b[33mPARTIAL (${f.successRuns}/${RUNS_PER_SKILL})\x1b[0m`;
        originalLog(`${status}  ${f.categoryId} > ${f.skillId} (${f.label})`);
        for (const e of f.errors.slice(0, 3)) {
            originalLog(`         ${e}`);
        }
        if (f.errors.length > 3) {
            originalLog(`         ... and ${f.errors.length - 3} more errors`);
        }
        originalLog('');
    }
}

// Output as structured text for easy parsing
originalLog('\n\x1b[36m=== FULL RESULTS (TSV) ===\x1b[0m');
originalLog('Category\tSkill\tStatus\tPass/Total\tFirst Error');
for (const { categoryId, skillId } of skillsToTest) {
    const failed = failedSkills.find(f => f.categoryId === categoryId && f.skillId === skillId);
    if (failed) {
        const status = failed.successRuns === 0 ? 'FAIL' : 'PARTIAL';
        originalLog(`${categoryId}\t${skillId}\t${status}\t${failed.successRuns}/${RUNS_PER_SKILL}\t${failed.errors[0] || ''}`);
    } else {
        originalLog(`${categoryId}\t${skillId}\tPASS\t${RUNS_PER_SKILL}/${RUNS_PER_SKILL}\t`);
    }
}

process.exit(failCount > 0 ? 1 : 0);
