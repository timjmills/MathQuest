// Quiz Storage — IndexedDB CRUD for tests & results
// Layer 1: depends only on state.js

const DB_NAME = 'mathquest_quizzes';
const DB_VERSION = 1;
let dbInstance = null;

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function openDB() {
    if (dbInstance) return Promise.resolve(dbInstance);
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onupgradeneeded = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('tests')) {
                const testStore = db.createObjectStore('tests', { keyPath: 'id' });
                testStore.createIndex('createdAt', 'createdAt');
            }
            if (!db.objectStoreNames.contains('results')) {
                const resultStore = db.createObjectStore('results', { keyPath: 'id' });
                resultStore.createIndex('testId', 'testId');
                resultStore.createIndex('completedAt', 'completedAt');
            }
        };
        req.onsuccess = (e) => {
            dbInstance = e.target.result;
            resolve(dbInstance);
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

export async function initQuizDB() {
    return openDB();
}

// ---- Section Migration & Helpers ----

export function migrateTestToSections(test) {
    if (!test) return test;
    if (test.sections) {
        // Ensure settings have new fields
        if (!test.settings) test.settings = {};
        if (!test.settings.sectionMode) test.settings.sectionMode = 'sequential';
        if (test.settings.shuffleWithinSections === undefined) test.settings.shuffleWithinSections = false;
        if (test.settings.printVersions === undefined) test.settings.printVersions = 1;
        return test;
    }

    // Wrap flat questions into a single section
    const questions = test.questions || [];
    test.sections = [{
        id: 0,
        label: 'Problem Set A',
        layout: { columns: 2, spacing: 'normal' },
        instructions: '',
        questions: questions.map((q, i) => ({
            id: i,
            skillId: q.skillId,
            questionData: q.questionData,
            points: q.points || 1
        }))
    }];

    delete test.questions;

    // Ensure settings have new fields
    if (!test.settings) test.settings = {};
    if (!test.settings.sectionMode) test.settings.sectionMode = 'sequential';
    if (test.settings.shuffleWithinSections === undefined) test.settings.shuffleWithinSections = false;
    if (test.settings.printVersions === undefined) test.settings.printVersions = 1;

    return test;
}

export function getAllQuestionsFlat(test) {
    if (!test || !test.sections) return [];
    const result = [];
    let globalIdx = 0;
    for (let sIdx = 0; sIdx < test.sections.length; sIdx++) {
        const section = test.sections[sIdx];
        for (let qIdx = 0; qIdx < section.questions.length; qIdx++) {
            result.push({
                question: section.questions[qIdx],
                sectionIdx: sIdx,
                localIdx: qIdx,
                globalIdx: globalIdx++
            });
        }
    }
    return result;
}

export function getGlobalOffset(test, sectionIdx) {
    if (!test || !test.sections) return 0;
    let count = 0;
    for (let i = 0; i < sectionIdx && i < test.sections.length; i++) {
        count += test.sections[i].questions.length;
    }
    return count;
}

export function getTotalQuestionCount(test) {
    if (!test || !test.sections) return 0;
    return test.sections.reduce((sum, s) => sum + s.questions.length, 0);
}

// ---- Tests CRUD ----

export async function saveTest(test) {
    if (!test.id) test.id = generateId();
    if (!test.createdAt) test.createdAt = Date.now();
    test.updatedAt = Date.now();
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('tests', 'readwrite');
        tx.objectStore('tests').put(test);
        tx.oncomplete = () => resolve(test);
        tx.onerror = (e) => reject(e.target.error);
    });
}

export async function loadTest(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('tests', 'readonly');
        const req = tx.objectStore('tests').get(id);
        req.onsuccess = () => {
            const test = req.result || null;
            if (test) migrateTestToSections(test);
            resolve(test);
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

export async function listTests() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('tests', 'readonly');
        const req = tx.objectStore('tests').index('createdAt').getAll();
        req.onsuccess = () => {
            const results = req.result || [];
            results.sort((a, b) => b.createdAt - a.createdAt);
            resolve(results);
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

export async function deleteTest(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(['tests', 'results'], 'readwrite');
        tx.objectStore('tests').delete(id);
        const resultStore = tx.objectStore('results');
        const idx = resultStore.index('testId');
        const cursorReq = idx.openCursor(IDBKeyRange.only(id));
        cursorReq.onsuccess = (e) => {
            const cursor = e.target.result;
            if (cursor) {
                cursor.delete();
                cursor.continue();
            }
        };
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
    });
}

// ---- Results CRUD ----

export async function saveResult(result) {
    if (!result.id) result.id = generateId();
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('results', 'readwrite');
        tx.objectStore('results').put(result);
        tx.oncomplete = () => resolve(result);
        tx.onerror = (e) => reject(e.target.error);
    });
}

export async function getResultsForTest(testId) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('results', 'readonly');
        const idx = tx.objectStore('results').index('testId');
        const req = idx.getAll(IDBKeyRange.only(testId));
        req.onsuccess = () => {
            const results = req.result || [];
            results.sort((a, b) => b.completedAt - a.completedAt);
            resolve(results);
        };
        req.onerror = (e) => reject(e.target.error);
    });
}

export async function deleteResult(id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('results', 'readwrite');
        tx.objectStore('results').delete(id);
        tx.oncomplete = () => resolve();
        tx.onerror = (e) => reject(e.target.error);
    });
}

// ---- Export / Import ----

export async function exportTestJSON(id) {
    const test = await loadTest(id);
    if (!test) return null;
    return JSON.stringify(test, null, 2);
}

export async function importTestJSON(jsonStr) {
    const test = JSON.parse(jsonStr);
    test.id = generateId();
    test.createdAt = Date.now();
    test.updatedAt = Date.now();
    migrateTestToSections(test);
    return saveTest(test);
}

export async function exportResultsCSV(testId) {
    const results = await getResultsForTest(testId);
    if (!results.length) return '';
    const test = await loadTest(testId);
    if (!test) return '';
    const allQs = getAllQuestionsFlat(test);
    const qCount = allQs.length;

    let headers = ['Student Name', 'Score', 'Total', 'Percentage', 'Time (min)', 'Date'];
    for (let i = 1; i <= qCount; i++) headers.push('Q' + i);
    let csv = headers.join(',') + '\n';

    for (const r of results) {
        const timeMins = r.completedAt && r.startedAt
            ? Math.round((r.completedAt - r.startedAt) / 60000)
            : '';
        const date = r.completedAt ? new Date(r.completedAt).toLocaleDateString() : '';
        const row = [
            '"' + (r.studentName || '').replace(/"/g, '""') + '"',
            r.score,
            r.totalPoints,
            r.percentage + '%',
            timeMins,
            date
        ];
        for (let i = 0; i < qCount; i++) {
            const a = r.answers && r.answers[i];
            row.push(a ? (a.correct ? 'correct' : 'incorrect') : 'skipped');
        }
        csv += row.join(',') + '\n';
    }
    return csv;
}

// ---- URL Compression (LZString wrapper) ----

export function compressTestForURL(test) {
    migrateTestToSections(test);
    const minimal = {
        n: test.name,
        sc: test.sections.map(s => ({
            l: s.label,
            ly: s.layout,
            ins: s.instructions || '',
            q: s.questions.map(q => ({ s: q.skillId, d: q.questionData, p: q.points || 1 }))
        })),
        st: test.settings
    };
    const json = JSON.stringify(minimal);
    if (typeof LZString !== 'undefined') {
        return LZString.compressToEncodedURIComponent(json);
    }
    return btoa(unescape(encodeURIComponent(json)));
}

export function decompressTestFromURL(compressed) {
    let json;
    if (typeof LZString !== 'undefined') {
        json = LZString.decompressFromEncodedURIComponent(compressed);
    }
    if (!json) {
        try {
            json = decodeURIComponent(escape(atob(compressed)));
        } catch (e) {
            return null;
        }
    }
    if (!json) return null;
    try {
        const minimal = JSON.parse(json);
        const defaultSettings = {
            timeLimit: null,
            randomOrder: false,
            showFeedback: 'end',
            allowRetry: false,
            passingScore: 70,
            sectionMode: 'sequential',
            shuffleWithinSections: false,
            printVersions: 1
        };
        const settings = Object.assign(defaultSettings, minimal.st || {});

        // New format: sections via `sc`
        if (minimal.sc) {
            return {
                id: generateId(),
                name: minimal.n || 'Untitled Quiz',
                createdAt: Date.now(),
                updatedAt: Date.now(),
                sections: minimal.sc.map((s, sIdx) => ({
                    id: sIdx,
                    label: s.l || 'Problem Set ' + String.fromCharCode(65 + sIdx),
                    layout: s.ly || { columns: 2, spacing: 'normal' },
                    instructions: s.ins || '',
                    questions: (s.q || []).map((q, i) => ({
                        id: i,
                        skillId: q.s,
                        questionData: q.d,
                        points: q.p || 1
                    }))
                })),
                settings
            };
        }

        // Old format: flat `q` array — migrate to sections
        const test = {
            id: generateId(),
            name: minimal.n || 'Untitled Quiz',
            createdAt: Date.now(),
            updatedAt: Date.now(),
            questions: (minimal.q || []).map((q, i) => ({
                id: i,
                skillId: q.s,
                questionData: q.d,
                points: q.p || 1
            })),
            settings
        };
        migrateTestToSections(test);
        return test;
    } catch (e) {
        return null;
    }
}
