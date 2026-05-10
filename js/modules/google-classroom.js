// ============================================================
// google-classroom.js — Google Forms / Classroom Export
// ============================================================
import { showToast } from './ui-core.js';
import { GOOGLE_CLIENT_ID } from './data.js';

// ── Section 1: Configuration & State ────────────────────────

const SCOPES = 'https://www.googleapis.com/auth/forms.body https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/classroom.coursework.students https://www.googleapis.com/auth/classroom.courses.readonly';

let accessToken = null;
let tokenExpiry = 0;
let tokenClient = null;
let currentExportAbort = null;
let pendingExportProblems = null;

const NON_EXPORTABLE_TYPES = ['tchart-drag', 'divisibility-sort', 'odd-even-select'];

// ── Section 2: OAuth Functions ──────────────────────────────

export function initGoogleAuth() {
    if (!window.google?.accounts?.oauth2) return false;
    try {
        tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: GOOGLE_CLIENT_ID,
            scope: SCOPES,
            callback: () => {} // replaced dynamically in requestGoogleToken
        });
        return true;
    } catch (e) {
        console.error('Failed to init Google auth:', e);
        return false;
    }
}

export function requestGoogleToken() {
    return new Promise((resolve, reject) => {
        if (!tokenClient) {
            reject(new Error('Google auth not initialized'));
            return;
        }
        tokenClient.callback = (response) => {
            if (response.error) {
                reject(new Error(response.error));
                return;
            }
            accessToken = response.access_token;
            tokenExpiry = Date.now() + 3500000;
            resolve(accessToken);
        };
        tokenClient.error_callback = (err) => {
            reject(new Error(err.type || 'popup_closed'));
        };
        tokenClient.requestAccessToken();
    });
}

export async function ensureValidToken() {
    if (Date.now() > tokenExpiry) {
        await requestGoogleToken();
    }
    return accessToken;
}

export function isGoogleAuthenticated() {
    return !!accessToken && Date.now() < tokenExpiry;
}

export function revokeGoogleToken() {
    if (accessToken) {
        try {
            window.google.accounts.oauth2.revoke(accessToken);
        } catch (e) {
            // ignore revoke errors
        }
    }
    accessToken = null;
    tokenExpiry = 0;
    tokenClient = null;
}

// ── Section 3: Image Rendering ──────────────────────────────

function stripInteractiveElements(html) {
    if (!html) return '';
    let clean = html;
    // Replace input elements with underline blanks
    clean = clean.replace(/<input[^>]*>/gi, '<span style="display:inline-block;width:60px;border-bottom:2px solid #333;">&nbsp;</span>');
    // Remove onclick/onchange/oninput handlers
    clean = clean.replace(/\s+on(click|change|input|focus|blur|keydown|keyup|keypress|mousedown|mouseup|mouseover|mouseout)="[^"]*"/gi, '');
    clean = clean.replace(/\s+on(click|change|input|focus|blur|keydown|keyup|keypress|mousedown|mouseup|mouseover|mouseout)='[^']*'/gi, '');
    return clean;
}

export async function renderProblemToCanvas(problem, index) {
    const div = document.createElement('div');
    div.style.cssText = 'position:absolute;left:-9999px;width:600px;background:white;color:#222;font-family:Nunito,sans-serif;padding:20px;';

    let innerHtml = `<div style="font-weight:700;font-size:1.1rem;margin-bottom:8px;">Problem ${index + 1}</div>`;
    innerHtml += `<div style="font-size:1.2rem;margin-bottom:12px;">${stripInteractiveElements(problem.text || '')}</div>`;

    if (problem.visual) {
        innerHtml += `<div style="margin-bottom:12px;">${stripInteractiveElements(problem.visual)}</div>`;
    }

    if (problem.answerType === 'multiple-choice' && problem.options && problem.options.length > 0) {
        const labels = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
        let mcHtml = '<div style="margin-top:10px;">';
        problem.options.forEach((opt, i) => {
            mcHtml += `<div style="padding:4px 0;font-size:1.05rem;">${labels[i] || String(i + 1)}. ${opt}</div>`;
        });
        mcHtml += '</div>';
        innerHtml += mcHtml;
    }

    div.innerHTML = innerHtml;
    document.body.appendChild(div);

    try {
        const canvas = await window.html2canvas(div, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        const blob = await new Promise((resolve, reject) => {
            canvas.toBlob((b) => {
                if (b) resolve(b);
                else reject(new Error('Canvas toBlob failed'));
            }, 'image/png');
        });
        return blob;
    } finally {
        document.body.removeChild(div);
    }
}

export async function renderProblemsToBlobs(problems, onProgress) {
    const results = [];
    for (let i = 0; i < problems.length; i++) {
        const blob = await renderProblemToCanvas(problems[i], i);
        results.push({ blob, problem: problems[i] });
        if (onProgress) onProgress(i + 1, problems.length);
    }
    return results;
}

// ── Section 4: Google Drive ─────────────────────────────────

export async function createExportFolder(folderName, token) {
    const resp = await fetch('https://www.googleapis.com/drive/v3/files', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: folderName,
            mimeType: 'application/vnd.google-apps.folder'
        })
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to create Drive folder: ${err}`);
    }
    const data = await resp.json();
    return data.id;
}

export async function uploadImageToDrive(blob, filename, folderId, token) {
    const metadata = {
        name: filename,
        mimeType: 'image/png',
        parents: [folderId]
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', blob);

    const resp = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: form
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to upload image: ${err}`);
    }
    return await resp.json();
}

export async function makeFilePublic(fileId, token) {
    const resp = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}/permissions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            role: 'reader',
            type: 'anyone'
        })
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to set file permissions: ${err}`);
    }
    return await resp.json();
}

export function getPublicImageUrl(fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
}

export async function uploadAllImages(blobs, folderId, token, onProgress) {
    const results = [];
    for (let i = 0; i < blobs.length; i++) {
        const { blob, problem } = blobs[i];
        const filename = `problem_${String(i + 1).padStart(3, '0')}.png`;
        const uploaded = await uploadImageToDrive(blob, filename, folderId, token);
        await makeFilePublic(uploaded.id, token);
        const publicUrl = getPublicImageUrl(uploaded.id);
        results.push({ fileId: uploaded.id, publicUrl, problem });
        if (onProgress) onProgress(i + 1, blobs.length);
        // Small delay to avoid rate limits
        if (i < blobs.length - 1) {
            await new Promise(r => setTimeout(r, 200));
        }
    }
    return results;
}

// ── Section 5: Google Forms ─────────────────────────────────

export async function createGoogleForm(title, token) {
    const resp = await fetch('https://forms.googleapis.com/v1/forms', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            info: { title }
        })
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to create Google Form: ${err}`);
    }
    const data = await resp.json();
    return { formId: data.formId, responderUri: data.responderUri };
}

export async function enableQuizMode(formId, token) {
    const resp = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requests: [{
                updateSettings: {
                    settings: {
                        quizSettings: { isQuiz: true }
                    },
                    updateMask: 'quizSettings.isQuiz'
                }
            }]
        })
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to enable quiz mode: ${err}`);
    }
    return await resp.json();
}

export function mapToFormQuestion(problem, imageUrl, index, pointsPerQ) {
    // Skip non-exportable types
    if (NON_EXPORTABLE_TYPES.includes(problem.answerType)) return null;

    const questionImage = {
        sourceUri: imageUrl,
        properties: {
            alignment: 'LEFT'
        }
    };

    // Handle dual type: create two question items
    if (problem.answerType === 'dual') {
        const answers = String(problem.ans).split(',').map(a => a.trim());
        const halfPoints = Math.max(1, Math.round(pointsPerQ / 2));
        const items = [];
        items.push({
            createItem: {
                item: {
                    title: `Problem ${index + 1} (Part A)`,
                    description: problem.skillLabel || undefined,
                    questionItem: {
                        image: questionImage,
                        question: {
                            required: true,
                            textQuestion: { paragraph: false },
                            grading: {
                                pointValue: halfPoints,
                                correctAnswers: { answers: [{ value: answers[0] || String(problem.ans) }] }
                            }
                        }
                    }
                },
                location: { index: index * 2 }
            }
        });
        items.push({
            createItem: {
                item: {
                    title: `Problem ${index + 1} (Part B)`,
                    questionItem: {
                        question: {
                            required: true,
                            textQuestion: { paragraph: false },
                            grading: {
                                pointValue: halfPoints,
                                correctAnswers: { answers: [{ value: answers[1] || '' }] }
                            }
                        }
                    }
                },
                location: { index: index * 2 + 1 }
            }
        });
        return items;
    }

    // Multiple choice
    if (problem.answerType === 'multiple-choice' && problem.options && problem.options.length > 0) {
        return {
            createItem: {
                item: {
                    title: `Problem ${index + 1}`,
                    description: problem.skillLabel || undefined,
                    questionItem: {
                        image: questionImage,
                        question: {
                            required: true,
                            choiceQuestion: {
                                type: 'RADIO',
                                options: problem.options.map(o => ({ value: String(o) }))
                            },
                            grading: {
                                pointValue: pointsPerQ,
                                correctAnswers: { answers: [{ value: String(problem.ans) }] }
                            }
                        }
                    }
                },
                location: { index }
            }
        };
    }

    // Default: text/number input
    return {
        createItem: {
            item: {
                title: `Problem ${index + 1}`,
                description: problem.skillLabel || undefined,
                questionItem: {
                    image: questionImage,
                    question: {
                        required: true,
                        textQuestion: { paragraph: false },
                        grading: {
                            pointValue: pointsPerQ,
                            correctAnswers: { answers: [{ value: String(problem.ans) }] }
                        }
                    }
                }
            },
            location: { index }
        }
    };
}

export async function addQuestionsToForm(formId, questionsWithImages, token, pointsPerQ, onProgress) {
    // Build all requests
    const allRequests = [];
    let locationIndex = 0;
    for (let i = 0; i < questionsWithImages.length; i++) {
        const { publicUrl, problem } = questionsWithImages[i];
        const result = mapToFormQuestion(problem, publicUrl, locationIndex, pointsPerQ);
        if (result === null) continue;
        if (Array.isArray(result)) {
            // dual type returns array
            result.forEach(r => {
                r.createItem.item.questionItem && (r.createItem.location.index = locationIndex);
                allRequests.push(r);
                locationIndex++;
            });
        } else {
            result.createItem.location.index = locationIndex;
            allRequests.push(result);
            locationIndex++;
        }
    }

    if (allRequests.length === 0) {
        throw new Error('No exportable questions found.');
    }

    // Batch in chunks of 20
    const chunkSize = 20;
    const totalChunks = Math.ceil(allRequests.length / chunkSize);
    for (let c = 0; c < totalChunks; c++) {
        const chunk = allRequests.slice(c * chunkSize, (c + 1) * chunkSize);
        const resp = await fetch(`https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ requests: chunk })
        });
        if (!resp.ok) {
            const err = await resp.text();
            throw new Error(`Failed to add questions (batch ${c + 1}): ${err}`);
        }
        if (onProgress) onProgress(Math.min((c + 1) * chunkSize, allRequests.length), allRequests.length);
        // Delay between batches
        if (c < totalChunks - 1) {
            await new Promise(r => setTimeout(r, 500));
        }
    }
}

// ── Section 6: Google Classroom ─────────────────────────────

export async function listClassroomCourses(token) {
    const resp = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to list courses: ${err}`);
    }
    const data = await resp.json();
    return (data.courses || []).map(c => ({
        id: c.id,
        name: c.name,
        section: c.section || ''
    }));
}

export async function createClassroomAssignment(courseId, formUrl, title, token) {
    const resp = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: title,
            workType: 'ASSIGNMENT',
            materials: [{ link: { url: formUrl } }],
            state: 'DRAFT'
        })
    });
    if (!resp.ok) {
        const err = await resp.text();
        throw new Error(`Failed to create Classroom assignment: ${err}`);
    }
    return await resp.json();
}

// ── Section 7: Export Modal UI ──────────────────────────────

export function openGoogleExportModal(problems, source) {
    pendingExportProblems = problems;
    currentExportAbort = new AbortController();

    // Count skippable problems
    const skippable = problems.filter(p => NON_EXPORTABLE_TYPES.includes(p.answerType));
    const exportableCount = problems.length - skippable.length;

    // Remove existing modal if present
    const existing = document.getElementById('googleExportOverlay');
    if (existing) existing.remove();

    const defaultTitle = source === 'quiz' ? 'Quiz' : 'Math Worksheet';
    const warningHtml = skippable.length > 0
        ? `<div id="gexWarning" class="google-export-warning">${skippable.length} interactive problem(s) will be skipped (drag-and-drop, sorting, etc.)</div>`
        : '<div id="gexWarning" class="google-export-warning" style="display:none;"></div>';

    const overlay = document.createElement('div');
    overlay.className = 'google-export-overlay';
    overlay.id = 'googleExportOverlay';
    overlay.innerHTML = `
        <div class="google-export-modal">
            <div class="google-export-header">
                <h3>Export to Google Forms</h3>
                <button onclick="closeGoogleExportModal()" class="modal-close">&times;</button>
            </div>

            <div class="google-export-stepper">
                <div class="google-export-step active" data-step="1"><span class="step-num">1</span><span class="step-label">Sign In</span></div>
                <div class="google-export-step" data-step="2"><span class="step-num">2</span><span class="step-label">Render</span></div>
                <div class="google-export-step" data-step="3"><span class="step-num">3</span><span class="step-label">Upload</span></div>
                <div class="google-export-step" data-step="4"><span class="step-num">4</span><span class="step-label">Create Form</span></div>
                <div class="google-export-step" data-step="5"><span class="step-num">5</span><span class="step-label">Done</span></div>
            </div>

            <div class="google-export-body">
                <div id="gexConfig">
                    <label style="font-weight:600;font-size:0.9rem;">Worksheet Title</label>
                    <input type="text" id="gexTitle" value="${defaultTitle}" style="width:100%;padding:10px;border:2px solid var(--text-dim);border-radius:8px;background:var(--bg-card);color:var(--text-primary);font-size:1rem;margin:6px 0 14px;box-sizing:border-box;">

                    <label style="font-weight:600;font-size:0.9rem;">Points per Question</label>
                    <select id="gexPoints" style="width:100%;padding:10px;border:2px solid var(--text-dim);border-radius:8px;background:var(--bg-card);color:var(--text-primary);font-size:1rem;margin:6px 0 14px;">
                        <option value="1">1 point</option>
                        <option value="2" selected>2 points</option>
                        <option value="5">5 points</option>
                        <option value="10">10 points</option>
                    </select>

                    <div id="gexClassroomSection" style="display:none;">
                        <label style="font-weight:600;font-size:0.9rem;">Assign to Google Classroom (optional)</label>
                        <select id="gexCourse" style="width:100%;padding:10px;border:2px solid var(--text-dim);border-radius:8px;background:var(--bg-card);color:var(--text-primary);font-size:1rem;margin:6px 0 14px;">
                            <option value="">-- Don't assign --</option>
                        </select>
                    </div>

                    ${warningHtml}

                    <div style="font-size:0.85rem;color:var(--text-dim);margin-bottom:14px;">
                        ${exportableCount} of ${problems.length} problems will be exported
                    </div>
                </div>

                <div id="gexProgress" style="display:none;">
                    <div class="google-export-progress"><div class="google-export-progress-fill" id="gexProgressFill"></div></div>
                    <div class="google-export-status" id="gexStatus">Preparing...</div>
                </div>

                <div id="gexResult" class="google-export-result" style="display:none;"></div>
            </div>

            <div class="google-export-actions">
                <button onclick="closeGoogleExportModal()" style="padding:10px 20px;border:2px solid var(--text-dim);border-radius:8px;background:transparent;color:var(--text-primary);cursor:pointer;font-weight:600;">Cancel</button>
                <button id="gexActionBtn" class="google-export-btn google-auth" onclick="startGoogleExport()">
                    Sign in with Google
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    // Close on overlay background click
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeGoogleExportModal();
    });
}

export function closeGoogleExportModal() {
    if (currentExportAbort) {
        currentExportAbort.abort();
        currentExportAbort = null;
    }
    const overlay = document.getElementById('googleExportOverlay');
    if (overlay) overlay.remove();
    pendingExportProblems = null;
}

function updateExportStep(stepNum) {
    const steps = document.querySelectorAll('.google-export-step');
    steps.forEach(step => {
        const num = parseInt(step.getAttribute('data-step'));
        step.classList.remove('active', 'complete');
        if (num < stepNum) {
            step.classList.add('complete');
        } else if (num === stepNum) {
            step.classList.add('active');
        }
    });
}

function updateExportProgress(percent, statusText) {
    const fill = document.getElementById('gexProgressFill');
    const status = document.getElementById('gexStatus');
    if (fill) fill.style.width = percent + '%';
    if (status) status.textContent = statusText;
}

// ── Section 8: Export Orchestrator ──────────────────────────

export async function startGoogleExport() {
    const problems = pendingExportProblems;
    if (!problems || !problems.length) {
        showToast('No problems to export.', 'error');
        return;
    }

    const title = document.getElementById('gexTitle')?.value || 'Math Worksheet';
    const pointsPerQ = parseInt(document.getElementById('gexPoints')?.value) || 2;

    // Filter out non-exportable types
    const exportable = problems.filter(p => !NON_EXPORTABLE_TYPES.includes(p.answerType));
    if (!exportable.length) {
        showToast('No exportable problems found.', 'error');
        return;
    }

    try {
        // Step 1: Authenticate
        updateExportStep(1);
        if (!initGoogleAuth()) {
            showToast('Google sign-in not available. Check your connection.', 'error');
            return;
        }
        await requestGoogleToken();

        // After auth, try to load Classroom courses
        try {
            const courses = await listClassroomCourses(accessToken);
            if (courses.length > 0) {
                const section = document.getElementById('gexClassroomSection');
                const select = document.getElementById('gexCourse');
                if (section && select) {
                    courses.forEach(c => {
                        const opt = document.createElement('option');
                        opt.value = c.id;
                        opt.textContent = c.name + (c.section ? ` - ${c.section}` : '');
                        select.appendChild(opt);
                    });
                    section.style.display = 'block';
                }
                // Change button to "Export" and update onclick
                const btn = document.getElementById('gexActionBtn');
                if (btn) {
                    btn.textContent = 'Export to Google Forms';
                    btn.className = 'google-export-btn';
                    btn.onclick = () => executeGoogleExport(exportable, title, pointsPerQ);
                }
                return; // Wait for user to click Export
            }
        } catch (e) {
            // Classroom access might fail — that's OK, proceed without it
        }

        // No Classroom courses or Classroom failed — proceed directly
        await executeGoogleExport(exportable, title, pointsPerQ);
    } catch (err) {
        if (err.message?.includes('popup_closed') || err.message?.includes('access_denied')) {
            showToast('Google sign-in was cancelled.', 'info');
        } else {
            showToast('Export failed: ' + (err.message || 'Unknown error'), 'error');
            console.error('Google export error:', err);
        }
        updateExportProgress(0, 'Export failed. Please try again.');
    }
}

async function executeGoogleExport(problems, title, pointsPerQ) {
    const courseId = document.getElementById('gexCourse')?.value || '';

    // Show progress, hide config
    const configEl = document.getElementById('gexConfig');
    const progressEl = document.getElementById('gexProgress');
    const actionBtn = document.getElementById('gexActionBtn');
    if (configEl) configEl.style.display = 'none';
    if (progressEl) progressEl.style.display = 'block';
    if (actionBtn) actionBtn.style.display = 'none';

    const token = await ensureValidToken();

    // Step 2: Render images
    updateExportStep(2);
    updateExportProgress(0, 'Rendering problems as images...');
    const blobs = await renderProblemsToBlobs(problems, (current, total) => {
        updateExportProgress(Math.round((current / total) * 100), `Rendering problem ${current} of ${total}...`);
    });

    // Step 3: Upload to Drive
    updateExportStep(3);
    updateExportProgress(0, 'Creating folder on Google Drive...');
    const folderName = `MathQuest - ${title} - ${new Date().toLocaleDateString()}`;
    const folderId = await createExportFolder(folderName, token);

    updateExportProgress(0, 'Uploading images to Google Drive...');
    const uploaded = await uploadAllImages(blobs, folderId, token, (current, total) => {
        updateExportProgress(Math.round((current / total) * 100), `Uploading image ${current} of ${total}...`);
    });

    // Step 4: Create Google Form
    updateExportStep(4);
    updateExportProgress(0, 'Creating Google Form...');
    const { formId, responderUri } = await createGoogleForm(title, token);
    await enableQuizMode(formId, token);

    updateExportProgress(30, 'Adding questions to form...');
    await addQuestionsToForm(formId, uploaded, token, pointsPerQ, (current, total) => {
        updateExportProgress(30 + Math.round((current / total) * 70), `Adding question ${current} of ${total}...`);
    });

    // Step 5: Optionally assign to Classroom
    let classroomUrl = '';
    if (courseId) {
        updateExportStep(5);
        updateExportProgress(0, 'Creating Classroom assignment...');
        try {
            const assignment = await createClassroomAssignment(courseId, responderUri, title, token);
            classroomUrl = assignment.alternateLink || '';
        } catch (e) {
            console.warn('Classroom assignment failed:', e);
            // Continue — form was still created
        }
    }

    // Done!
    updateExportStep(5);
    const editUrl = `https://docs.google.com/forms/d/${formId}/edit`;

    if (progressEl) progressEl.style.display = 'none';
    const resultDiv = document.getElementById('gexResult');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div style="text-align:center;margin-bottom:16px;">
                <div style="font-size:2rem;margin-bottom:8px;">&#10003;</div>
                <div style="font-weight:700;font-size:1.1rem;color:var(--accent-green);">Export Complete!</div>
            </div>
            <div style="display:flex;flex-direction:column;gap:10px;">
                <a href="${responderUri}" target="_blank" style="display:block;padding:12px;background:var(--accent-cyan);color:white;text-align:center;border-radius:8px;text-decoration:none;font-weight:700;">
                    Open Form (Student View)
                </a>
                <a href="${editUrl}" target="_blank" style="display:block;padding:12px;background:var(--accent-purple, #7b1fa2);color:white;text-align:center;border-radius:8px;text-decoration:none;font-weight:700;">
                    Edit Form (Teacher View)
                </a>
                ${classroomUrl ? `<a href="${classroomUrl}" target="_blank" style="display:block;padding:12px;background:var(--accent-green);color:white;text-align:center;border-radius:8px;text-decoration:none;font-weight:700;">
                    View in Google Classroom
                </a>` : ''}
            </div>
            <div style="font-size:0.8rem;color:var(--text-dim);margin-top:12px;text-align:center;">
                ${problems.length} questions exported with auto-grading
            </div>
        `;
    }

    // Change cancel button to Close
    const cancelBtn = document.querySelector('.google-export-actions button:first-child');
    if (cancelBtn) cancelBtn.textContent = 'Close';

    showToast('Google Form created successfully!', 'success');
}

// ── Section 9: Entry Point Helpers ──────────────────────────

export function exportPrintToGoogleForms() {
    const sections = window.printSections || [];
    if (!sections.length) {
        showToast('No skills selected for printing.', 'error');
        return;
    }

    const problems = [];
    for (const sec of sections) {
        // Section field is `problemCount`, not `count` — historic bug fixed here.
        const count = sec.problemCount || sec.count || 10;
        // Pick first weighted skill in the section, or fall back to legacy fields.
        const sectionSkill = (sec.skills && sec.skills[0] && (sec.skills[0].skillId || sec.skills[0].skill))
            || sec.skillId
            || sec.skill;
        if (!sectionSkill) continue;
        for (let i = 0; i < count; i++) {
            const prevSkill = window.state?.skill;
            if (window.state) window.state.skill = sectionSkill;
            // generateQuestion() returns the problem object — it does NOT mutate in place.
            const q = (typeof window.generateQuestion === 'function')
                ? window.generateQuestion()
                : null;
            if (window.state && prevSkill !== undefined) window.state.skill = prevSkill;
            if (q && (q.text || q.visual)) problems.push(q);
        }
    }

    if (!problems.length) {
        showToast('Could not generate any problems.', 'error');
        return;
    }
    openGoogleExportModal(problems, 'print');
}

export async function exportQuizToGoogleForms(testId) {
    if (typeof window.loadTest !== 'function') {
        showToast('Quiz system not available.', 'error');
        return;
    }
    const test = await window.loadTest(testId);
    if (!test) {
        showToast('Could not load quiz.', 'error');
        return;
    }
    const questions = typeof window.getAllQuestionsFlat === 'function'
        ? window.getAllQuestionsFlat(test)
        : [];
    const problems = questions.map(q => ({
        text: q.questionData?.text || '',
        ans: q.questionData?.ans || '',
        answerType: q.questionData?.answerType || 'text',
        options: q.questionData?.options || [],
        visual: q.questionData?.visual || '',
        skillLabel: q.skillLabel || q.skillId || '',
        hint: q.questionData?.hint || '',
        printFormat: q.questionData?.printFormat || ''
    }));
    if (!problems.length) {
        showToast('Quiz has no questions to export.', 'error');
        return;
    }
    openGoogleExportModal(problems, 'quiz');
}

// All public functions are exported inline above.
