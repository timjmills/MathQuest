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
        req.onsuccess = () => resolve(req.result || null);
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
        // Also delete associated results
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
    // Generate new ID to avoid collisions
    test.id = generateId();
    test.createdAt = Date.now();
    test.updatedAt = Date.now();
    return saveTest(test);
}

export async function exportResultsCSV(testId) {
    const results = await getResultsForTest(testId);
    if (!results.length) return '';
    const test = await loadTest(testId);
    const qCount = test ? test.questions.length : 0;

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
        // Per-question results
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
    const minimal = {
        n: test.name,
        q: test.questions.map(q => ({
            s: q.skillId,
            d: q.questionData,
            p: q.points || 1
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
        return {
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
            settings: minimal.st || {
                timeLimit: null,
                randomOrder: false,
                showFeedback: 'end',
                allowRetry: false,
                passingScore: 70
            }
        };
    } catch (e) {
        return null;
    }
}
