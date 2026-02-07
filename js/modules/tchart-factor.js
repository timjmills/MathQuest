import { state } from './state.js';

const tchartState = {};

export function handleTchartDrop(event, tchartId, row, side, target) {
    event.preventDefault();
    const value = parseInt(event.dataTransfer.getData('text/plain'));
    
    // Initialize state for this T-chart if needed
    if (!tchartState[tchartId]) {
        tchartState[tchartId] = { rows: {}, usedFactors: new Set() };
    }
    
    const tState = tchartState[tchartId];
    
    // Initialize row if needed
    if (!tState.rows[row]) {
        tState.rows[row] = { left: null, right: null };
    }
    
    // Check if this factor is already placed elsewhere
    if (tState.usedFactors.has(value)) {
        showTchartFeedback(tchartId, `${value} is already placed! Remove it first.`, 'warning');
        return;
    }
    
    // Check if there's already a value in this cell
    const existingValue = tState.rows[row][side];
    if (existingValue !== null) {
        // Return existing value to bank
        returnFactorToBank(tchartId, existingValue);
        tState.usedFactors.delete(existingValue);
    }
    
    // Place the new value
    tState.rows[row][side] = value;
    tState.usedFactors.add(value);
    
    // Update the drop zone display
    const dropZone = event.currentTarget;
    dropZone.innerHTML = `<span class="placed-factor" style="padding:8px 16px;background:var(--accent-cyan);border-radius:6px;font-weight:700;font-size:1.2rem;color:var(--bg);cursor:pointer;"
        onclick="removeFromTchart('${tchartId}',${row},'${side}',${value})">${value}</span>`;
    dropZone.style.background = 'rgba(0,188,212,0.1)';
    dropZone.style.borderColor = 'var(--accent-cyan)';
    dropZone.style.borderStyle = 'solid';
    
    // Hide the factor from the bank
    hideFactorInBank(tchartId, value);
    
    // Check if this row is complete and validate
    validateTchartRow(tchartId, row, target);
    
    // Check if entire T-chart is complete
    checkTchartComplete(tchartId, target);
}

export function removeFromTchart(tchartId, row, side, value) {
    const tState = tchartState[tchartId];
    if (!tState) return;
    
    // Remove from state
    tState.rows[row][side] = null;
    tState.usedFactors.delete(value);
    
    // Reset the drop zone
    const tchart = document.getElementById(tchartId);
    const dropZones = tchart.querySelectorAll(`.tchart-drop-${side}[data-row="${row}"]`);
    dropZones.forEach(zone => {
        zone.innerHTML = `<span class="drop-placeholder" style="color:var(--text-dim);font-size:0.9rem;">drop here</span>`;
        zone.style.background = 'var(--bg-card)';
        zone.style.borderColor = 'var(--text-dim)';
        zone.style.borderStyle = 'dashed';
    });
    
    // Return factor to bank
    returnFactorToBank(tchartId, value);
    
    // Reset row check icon
    const checkDiv = tchart.querySelector(`.tchart-check[data-row="${row}"] .check-icon`);
    if (checkDiv) {
        checkDiv.textContent = '?';
        checkDiv.style.opacity = '0.3';
        checkDiv.style.color = 'var(--text)';
    }
}

export function hideFactorInBank(tchartId, value) {
    const bank = document.getElementById(tchartId + '-bank');
    if (!bank) return;
    const tiles = bank.querySelectorAll('.factor-tile');
    tiles.forEach(tile => {
        if (parseInt(tile.dataset.value) === value) {
            tile.style.opacity = '0.3';
            tile.style.pointerEvents = 'none';
            tile.draggable = false;
        }
    });
}

export function returnFactorToBank(tchartId, value) {
    const bank = document.getElementById(tchartId + '-bank');
    if (!bank) return;
    const tiles = bank.querySelectorAll('.factor-tile');
    tiles.forEach(tile => {
        if (parseInt(tile.dataset.value) === value) {
            tile.style.opacity = '1';
            tile.style.pointerEvents = 'auto';
            tile.draggable = true;
        }
    });
}

export function validateTchartRow(tchartId, row, target) {
    const tState = tchartState[tchartId];
    if (!tState || !tState.rows[row]) return;
    
    const rowData = tState.rows[row];
    const tchart = document.getElementById(tchartId);
    const checkDiv = tchart.querySelector(`.tchart-check[data-row="${row}"] .check-icon`);
    
    if (rowData.left === null || rowData.right === null) {
        // Row incomplete
        if (checkDiv) {
            checkDiv.textContent = '?';
            checkDiv.style.opacity = '0.3';
            checkDiv.style.color = 'var(--text)';
        }
        return;
    }
    
    // Both values placed - validate
    const left = rowData.left;
    const right = rowData.right;
    const product = left * right;
    const isValidProduct = product === target;
    const isValidOrder = left <= right;
    
    if (isValidProduct && isValidOrder) {
        // Correct!
        if (checkDiv) {
            checkDiv.textContent = '✓';
            checkDiv.style.opacity = '1';
            checkDiv.style.color = 'var(--accent-green)';
        }
        // Update row styling
        const leftZone = tchart.querySelector(`.tchart-drop-left[data-row="${row}"]`);
        const rightZone = tchart.querySelector(`.tchart-drop-right[data-row="${row}"]`);
        if (leftZone) leftZone.style.background = 'rgba(39,174,96,0.15)';
        if (rightZone) rightZone.style.background = 'rgba(39,174,96,0.15)';
    } else {
        // Incorrect
        if (checkDiv) {
            checkDiv.textContent = '✗';
            checkDiv.style.opacity = '1';
            checkDiv.style.color = 'var(--accent-red)';
        }
        // Show feedback
        if (!isValidProduct) {
            showTchartFeedback(tchartId, `${left} × ${right} = ${product}, not ${target}. Try again!`, 'error');
        } else if (!isValidOrder) {
            showTchartFeedback(tchartId, `Smaller number (${Math.min(left, right)}) should be on the LEFT!`, 'warning');
        }
    }
}

export function checkTchartComplete(tchartId, target) {
    const tState = tchartState[tchartId];
    if (!tState) return;
    
    const tchart = document.getElementById(tchartId);
    const numPairs = parseInt(tchart.dataset.pairs);
    
    let correctPairs = 0;
    let completedPairs = 0;
    
    for (let i = 0; i < numPairs; i++) {
        const rowData = tState.rows[i];
        if (rowData && rowData.left !== null && rowData.right !== null) {
            completedPairs++;
            if (rowData.left * rowData.right === target && rowData.left <= rowData.right) {
                correctPairs++;
            }
        }
    }
    
    if (completedPairs === numPairs) {
        if (correctPairs === numPairs) {
            showTchartFeedback(tchartId, `🎉 Perfect! All ${numPairs} factor pairs are correct!`, 'success');
            // Mark question as answered correctly
            if (state.currentQ && state.currentQ.answerType === 'tchart-drag') {
                // Auto-submit the correct answer
                handleTchartCompletion(true);
            }
        } else {
            showTchartFeedback(tchartId, `${correctPairs}/${numPairs} pairs correct. Fix the ✗ rows!`, 'warning');
        }
    }
}

export function handleTchartCompletion(isCorrect) {
    if (!state.currentQ) return;
    
    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    
    if (isCorrect) {
        feedback.className = "feedback-area correct";
        feedback.innerHTML = "🎉 Excellent! All factor pairs are correct!";
        state.score++;
        state.streak++;
        state.maxStreak = Math.max(state.maxStreak, state.streak);
    } else {
        feedback.className = "feedback-area incorrect";
        feedback.innerHTML = "Keep trying! Check the rows with ✗";
        state.streak = 0;
    }
    
    updateStats();
    
    // Show next question after delay if correct
    if (isCorrect) {
        setTimeout(() => {
            state.total++;
            showQuestion();
        }, 2000);
    }
}

export function showTchartFeedback(tchartId, message, type) {
    const feedbackDiv = document.getElementById(tchartId + '-feedback');
    if (!feedbackDiv) return;
    
    feedbackDiv.style.display = 'block';
    feedbackDiv.innerHTML = message;
    
    if (type === 'success') {
        feedbackDiv.style.background = 'rgba(39,174,96,0.2)';
        feedbackDiv.style.color = 'var(--accent-green)';
        feedbackDiv.style.border = '2px solid var(--accent-green)';
    } else if (type === 'error') {
        feedbackDiv.style.background = 'rgba(231,76,60,0.2)';
        feedbackDiv.style.color = 'var(--accent-red)';
        feedbackDiv.style.border = '2px solid var(--accent-red)';
    } else if (type === 'warning') {
        feedbackDiv.style.background = 'rgba(230,126,34,0.2)';
        feedbackDiv.style.color = 'var(--accent-orange)';
        feedbackDiv.style.border = '2px solid var(--accent-orange)';
    }
    
    // Auto-hide after 3 seconds for non-success messages
    if (type !== 'success') {
        setTimeout(() => {
            feedbackDiv.style.display = 'none';
        }, 3000);
    }
}

export function resetTchart(tchartId, factorsList) {
    // Reset state
    tchartState[tchartId] = { rows: {}, usedFactors: new Set() };
    
    const tchart = document.getElementById(tchartId);
    if (!tchart) return;
    
    // Reset all drop zones
    const leftZones = tchart.querySelectorAll('.tchart-drop-left');
    const rightZones = tchart.querySelectorAll('.tchart-drop-right');
    const checkIcons = tchart.querySelectorAll('.check-icon');
    
    [...leftZones, ...rightZones].forEach(zone => {
        zone.innerHTML = `<span class="drop-placeholder" style="color:var(--text-dim);font-size:0.9rem;">drop here</span>`;
        zone.style.background = 'var(--bg-card)';
        zone.style.borderColor = 'var(--text-dim)';
        zone.style.borderStyle = 'dashed';
    });
    
    checkIcons.forEach(icon => {
        icon.textContent = '?';
        icon.style.opacity = '0.3';
        icon.style.color = 'var(--text)';
    });
    
    // Reset factor bank
    const bank = document.getElementById(tchartId + '-bank');
    if (bank) {
        const tiles = bank.querySelectorAll('.factor-tile');
        tiles.forEach(tile => {
            tile.style.opacity = '1';
            tile.style.pointerEvents = 'auto';
            tile.draggable = true;
        });
    }
    
    // Hide feedback
    const feedbackDiv = document.getElementById(tchartId + '-feedback');
    if (feedbackDiv) feedbackDiv.style.display = 'none';
}

