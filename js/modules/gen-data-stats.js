// gen-data-stats.js - Data & Statistics question generation
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';

// generate-question.js post-strips q.options when no array element is a
// non-numeric string. Our multi-select-check options are objects
// ({id,label,correct}), so the stripper would wipe them — leaving the widget
// with "0 of 0 selected". Marking the array via a non-enumerable .some
// override that satisfies the predicate keeps the structured options intact
// without changing what the widget iterates (.map / .length).
function _preserveOptionsForWidget(options) {
    try {
        Object.defineProperty(options, 'some', {
            value: function () { return true; },
            writable: true,
            configurable: true,
            enumerable: false,
        });
    } catch (e) { /* fall through — worst case the stripper still runs */ }
    return options;
}

export function generateDataStatsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;

            // ===== BOX PLOT INTRO (Grade 5) — Phase 5 batch 3 =====
            // Generate 5-number summary, render an SVG box plot, ask median/IQR/range
            if (mappedSkill === "box_plot_intro") {
                // Generate plausible 5-number summary on integers within 0-50
                const min = randInt(1, 12);
                const q1 = min + randInt(2, 6);
                const median = q1 + randInt(2, 6);
                const q3 = median + randInt(2, 6);
                const max = q3 + randInt(2, 8);
                const iqr = q3 - q1;
                const rangeVal = max - min;

                // Pick question type
                const askType = pick(['median', 'iqr', 'range', 'min', 'max', 'q1', 'q3']);
                const askMap = {
                    median: { label: 'median', val: median, hint: `The median is the line inside the box.` },
                    iqr:    { label: 'interquartile range (IQR)', val: iqr, hint: `IQR = Q3 − Q1 = ${q3} − ${q1}.` },
                    range:  { label: 'range', val: rangeVal, hint: `Range = max − min = ${max} − ${min}.` },
                    min:    { label: 'minimum value', val: min, hint: `The minimum is the left whisker tip.` },
                    max:    { label: 'maximum value', val: max, hint: `The maximum is the right whisker tip.` },
                    q1:     { label: 'first quartile (Q1)', val: q1, hint: `Q1 is the left edge of the box.` },
                    q3:     { label: 'third quartile (Q3)', val: q3, hint: `Q3 is the right edge of the box.` },
                };
                const ask = askMap[askType];

                // Render SVG box plot scaled across [0, niceMax]
                const niceMax = Math.ceil((max + 2) / 5) * 5;
                const W = 480, H = 110, padL = 30, padR = 30;
                const usable = W - padL - padR;
                const xFor = (v) => padL + (v / niceMax) * usable;
                const axisY = 75;
                const boxTop = 50, boxBot = 90;
                const tickLines = [];
                for (let v = 0; v <= niceMax; v += 5) {
                    const x = xFor(v);
                    tickLines.push(`<line x1="${x}" y1="${axisY}" x2="${x}" y2="${axisY + 6}" stroke="#333" stroke-width="1.4"/>`);
                    tickLines.push(`<text x="${x}" y="${axisY + 22}" text-anchor="middle" font-size="10" fill="#333">${v}</text>`);
                }
                const xMin = xFor(min), xQ1 = xFor(q1), xMed = xFor(median), xQ3 = xFor(q3), xMax = xFor(max);

                const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:480px;display:block;margin:0 auto;background:#fff;">
                    <!-- whisker line -->
                    <line x1="${xMin}" y1="${(boxTop + boxBot) / 2}" x2="${xMax}" y2="${(boxTop + boxBot) / 2}" stroke="#1565c0" stroke-width="2"/>
                    <!-- whisker caps -->
                    <line x1="${xMin}" y1="${boxTop + 4}" x2="${xMin}" y2="${boxBot - 4}" stroke="#1565c0" stroke-width="2"/>
                    <line x1="${xMax}" y1="${boxTop + 4}" x2="${xMax}" y2="${boxBot - 4}" stroke="#1565c0" stroke-width="2"/>
                    <!-- box -->
                    <rect x="${xQ1}" y="${boxTop}" width="${xQ3 - xQ1}" height="${boxBot - boxTop}" fill="#e3f2fd" stroke="#1565c0" stroke-width="2"/>
                    <!-- median line -->
                    <line x1="${xMed}" y1="${boxTop}" x2="${xMed}" y2="${boxBot}" stroke="#1565c0" stroke-width="2.5"/>
                    <!-- axis -->
                    <line x1="${padL}" y1="${axisY}" x2="${W - padR}" y2="${axisY}" stroke="#333" stroke-width="1.5"/>
                    ${tickLines.join('')}
                </svg>`;

                q.text = `Use the box plot. What is the ${ask.label}?`;
                q.ans = ask.val;
                q.hint = ask.hint;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.05rem;">Box Plot</div>
                    ${svg}
                </div>`;

                // Random answer type: 50% number, 50% multiple-choice
                if (Math.random() < 0.5) {
                    q.answerType = "number";
                } else {
                    q.answerType = "multiple-choice";
                    const candidates = new Set([min, q1, median, q3, max, iqr, rangeVal]);
                    candidates.delete(ask.val);
                    const distractors = shuffle([...candidates]).slice(0, 3);
                    q.options = shuffle([ask.val, ...distractors]);
                }

                q.skillLabel = "Box Plot";
                q.printFormat = "box-plot-intro";
                q.boxPlotData = { min, q1, median, q3, max, iqr, range: rangeVal, askType, ans: ask.val, niceMax };
                return;
            }

            // ===== HISTOGRAM READ (Grade 6) — Phase 5 batch 3 =====
            if (mappedSkill === "histogram_read") {
                // Pick 4-6 bins of width 5 or 10, build frequencies
                const numBins = pick([4, 5, 6]);
                const binWidth = pick([5, 10]);
                const binStart = pick([0, 10, 20, 30]);
                const bins = [];
                const freqs = [];
                for (let i = 0; i < numBins; i++) {
                    const lo = binStart + i * binWidth;
                    const hi = lo + binWidth;
                    bins.push({ lo, hi, label: `${lo}-${hi}` });
                    freqs.push(randInt(1, 12));
                }

                // Ensure unique max for "highest frequency" questions
                const maxFreq = Math.max(...freqs);
                const maxIndices = freqs.map((f, i) => f === maxFreq ? i : -1).filter(i => i >= 0);
                if (maxIndices.length > 1) {
                    freqs[maxIndices[0]] = maxFreq + 1;
                }

                const total = freqs.reduce((a, b) => a + b, 0);
                const finalMax = Math.max(...freqs);
                const winIdx = freqs.indexOf(finalMax);
                const finalMin = Math.min(...freqs);
                const minIdx = freqs.indexOf(finalMin);

                // Pick question type
                const askType = pick(['highest', 'lowest', 'total', 'in_bin', 'two_bins']);
                let q1Text, q1Ans, q1Type, q1Options;
                if (askType === 'highest') {
                    q1Text = `Which interval has the highest frequency?`;
                    q1Ans = bins[winIdx].label;
                    q1Type = "multiple-choice";
                    q1Options = shuffle(bins.map(b => b.label));
                } else if (askType === 'lowest') {
                    q1Text = `Which interval has the lowest frequency?`;
                    q1Ans = bins[minIdx].label;
                    q1Type = "multiple-choice";
                    q1Options = shuffle(bins.map(b => b.label));
                } else if (askType === 'total') {
                    q1Text = `How many total data points are shown?`;
                    q1Ans = total;
                    q1Type = "number";
                } else if (askType === 'in_bin') {
                    const idx = randInt(0, numBins - 1);
                    q1Text = `How many data points are in the interval ${bins[idx].label}?`;
                    q1Ans = freqs[idx];
                    q1Type = "number";
                } else {
                    // two_bins: sum of two adjacent bins
                    const idx = randInt(0, numBins - 2);
                    q1Text = `How many data points are between ${bins[idx].lo} and ${bins[idx + 1].hi}?`;
                    q1Ans = freqs[idx] + freqs[idx + 1];
                    q1Type = "number";
                }

                // Render SVG histogram
                const W = 480, H = 240, padL = 50, padR = 20, padT = 20, padB = 60;
                const plotW = W - padL - padR;
                const plotH = H - padT - padB;
                const niceMaxFreq = Math.max(5, Math.ceil((finalMax + 1) / 5) * 5);
                const barGap = 2;
                const barW = (plotW / numBins) - barGap;

                let yLabels = '';
                const yStep = niceMaxFreq <= 10 ? 1 : 2;
                for (let v = 0; v <= niceMaxFreq; v += yStep) {
                    const y = padT + plotH - (v / niceMaxFreq) * plotH;
                    yLabels += `<text x="${padL - 6}" y="${y + 3}" text-anchor="end" font-size="10" fill="#333">${v}</text>`;
                    yLabels += `<line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="#eee" stroke-width="0.7"/>`;
                }

                let bars = '';
                bins.forEach((b, i) => {
                    const x = padL + i * (barW + barGap) + barGap / 2;
                    const h = (freqs[i] / niceMaxFreq) * plotH;
                    const y = padT + plotH - h;
                    bars += `<rect x="${x}" y="${y}" width="${barW}" height="${h}" fill="#e3f2fd" stroke="#1565c0" stroke-width="1.6"/>`;
                    bars += `<text x="${x + barW / 2}" y="${padT + plotH + 14}" text-anchor="middle" font-size="9" fill="#333">${b.label}</text>`;
                });
                // Axis labels
                const axisX = `<line x1="${padL}" y1="${padT + plotH}" x2="${W - padR}" y2="${padT + plotH}" stroke="#333" stroke-width="1.5"/>`;
                const axisY = `<line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + plotH}" stroke="#333" stroke-width="1.5"/>`;
                const yTitle = `<text x="14" y="${padT + plotH / 2}" transform="rotate(-90, 14, ${padT + plotH / 2})" text-anchor="middle" font-size="11" font-weight="600" fill="#333">Frequency</text>`;
                const xTitle = `<text x="${padL + plotW / 2}" y="${padT + plotH + 38}" text-anchor="middle" font-size="11" font-weight="600" fill="#333">Value</text>`;

                const svg = `<svg viewBox="0 0 ${W} ${H}" width="100%" style="max-width:480px;display:block;margin:0 auto;background:#fff;">
                    ${yLabels}
                    ${bars}
                    ${axisX}${axisY}${yTitle}${xTitle}
                </svg>`;

                q.text = q1Text;
                q.ans = q1Ans;
                q.answerType = q1Type;
                if (q1Options) q.options = q1Options;
                q.hint = `Read the height of each bar against the Frequency axis.`;
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);font-size:1.05rem;">Histogram</div>
                    ${svg}
                </div>`;
                q.skillLabel = "Histogram";
                q.printFormat = "histogram-read";
                q.histogramData = { bins, freqs, total, askType, ans: q1Ans, niceMaxFreq };
                return;
            }

            // Data & Statistics Category - CCSS Aligned for Grades 3-5
            const dataSkill = mappedSkill === "mixed" ? pick(["bar_graph", "line_plot", "pictograph", "tally_chart", "pie_chart", "line_plot_fractions", "mean", "median", "mode", "range", "probability"]) : mappedSkill;

            // Scale data values based on range (cap at 200 to keep mental math reasonable)
            const dataMax = Math.min(Math.max(range, 10), 200);

            // Real-world contexts for graphs
            const contexts = [
                { title: "Favorite Pets", categories: ["Dogs", "Cats", "Fish", "Birds", "Hamsters"], icon: "\u2022" },
                { title: "Sports Played", categories: ["Soccer", "Baseball", "Basketball", "Tennis", "Swimming"], icon: "\u2022" },
                { title: "Favorite Fruits", categories: ["Apples", "Bananas", "Oranges", "Grapes", "Strawberries"], icon: "\u2022" },
                { title: "Weather This Week", categories: ["Mon", "Tue", "Wed", "Thu", "Fri"], icon: "\u2022" },
                { title: "Books Read", categories: ["Jan", "Feb", "Mar", "Apr", "May"], icon: "\u2022" }
            ];

            // Colors for charts
            const chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

            // ============================================================
            // Phase 4.5 batch 6 — multi-select / dnd variants for data skills
            // Each variant short-circuits via early return.
            // ============================================================

            if (dataSkill === "mean" && Math.random() < 0.20) {
                const targetMean = pick([5, 6, 8, 10, 12]);
                const setSize = pick([3, 4]);
                const numCandidates = randInt(4, 5);
                const candidates = [];
                let correctCount = 0;
                let safety = 0;
                while (candidates.length < numCandidates && safety < 200) {
                    safety++;
                    const wantCorrect = correctCount < 1 ? true : (Math.random() < 0.5);
                    let nums;
                    if (wantCorrect) {
                        const targetSum = targetMean * setSize;
                        nums = [];
                        let remaining = targetSum;
                        let bad = false;
                        for (let i = 0; i < setSize - 1; i++) {
                            const minV = Math.max(1, remaining - (setSize - 1 - i) * (targetMean * 2));
                            const maxV = Math.min(targetMean * 2, remaining - (setSize - 1 - i) * 1);
                            if (minV > maxV) { bad = true; break; }
                            const v = randInt(minV, maxV);
                            nums.push(v);
                            remaining -= v;
                        }
                        if (bad) continue;
                        if (remaining < 1 || remaining > targetMean * 2 + 5) continue;
                        nums.push(remaining);
                    } else {
                        nums = Array.from({ length: setSize }, () => randInt(1, targetMean * 2));
                        const m = nums.reduce((a, b) => a + b, 0) / setSize;
                        if (Math.abs(m - targetMean) < 0.5) continue;
                    }
                    const meanVal = nums.reduce((a, b) => a + b, 0) / setSize;
                    const isCorrect = Math.abs(meanVal - targetMean) < 0.01;
                    const key = nums.slice().sort((a, b) => a - b).join(',');
                    if (candidates.some(c => c.key === key)) continue;
                    if (isCorrect) correctCount++;
                    candidates.push({ nums, isCorrect, key });
                }
                if (candidates.length >= 3 && correctCount >= 1 && correctCount < candidates.length) {
                    const opts = candidates.map((c, i) => ({
                        id: 'opt' + i,
                        label: `{${c.nums.join(', ')}}`,
                        correct: c.isCorrect,
                    }));
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = `Click ALL data sets where the mean equals ${targetMean}.`;
                    q.ans = ans;
                    q.options = _preserveOptionsForWidget(opts);
                    q.answerType = 'multi-select-check';
                    q.hint = `Mean = sum ÷ count. For ${setSize} numbers, the sum should be ${targetMean * setSize}.`;
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Mean';
                    return;
                }
            }

            if (dataSkill === "median" && Math.random() < 0.20) {
                const targetMedian = pick([5, 6, 7, 8, 9, 10]);
                const setSize = 5;
                const numCandidates = randInt(4, 5);
                const candidates = [];
                let correctCount = 0;
                let safety = 0;
                while (candidates.length < numCandidates && safety < 200) {
                    safety++;
                    const wantCorrect = correctCount < 1 ? true : (Math.random() < 0.5);
                    let nums;
                    if (wantCorrect) {
                        const lower = [randInt(1, targetMedian - 1), randInt(1, targetMedian - 1)].sort((a, b) => a - b);
                        const upper = [randInt(targetMedian + 1, targetMedian + 8), randInt(targetMedian + 1, targetMedian + 8)].sort((a, b) => a - b);
                        nums = [...lower, targetMedian, ...upper];
                    } else {
                        nums = Array.from({ length: setSize }, () => randInt(1, targetMedian + 8)).sort((a, b) => a - b);
                        if (nums[2] === targetMedian) continue;
                    }
                    const med = nums.slice().sort((a, b) => a - b)[Math.floor(setSize / 2)];
                    const isCorrect = med === targetMedian;
                    const key = nums.slice().sort((a, b) => a - b).join(',');
                    if (candidates.some(c => c.key === key)) continue;
                    if (isCorrect) correctCount++;
                    candidates.push({ nums, isCorrect, key });
                }
                if (candidates.length >= 3 && correctCount >= 1 && correctCount < candidates.length) {
                    const opts = candidates.map((c, i) => ({
                        id: 'opt' + i,
                        label: `{${c.nums.join(', ')}}`,
                        correct: c.isCorrect,
                    }));
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = `Click ALL data sets where the median equals ${targetMedian}.`;
                    q.ans = ans;
                    q.options = _preserveOptionsForWidget(opts);
                    q.answerType = 'multi-select-check';
                    q.hint = `Median is the middle value when the data is sorted.`;
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Median';
                    return;
                }
            }

            if (dataSkill === "mode" && Math.random() < 0.20) {
                const targetMode = pick([3, 4, 5, 6, 7, 8]);
                const numCandidates = randInt(4, 5);
                const candidates = [];
                let correctCount = 0;
                let safety = 0;
                while (candidates.length < numCandidates && safety < 200) {
                    safety++;
                    const wantCorrect = correctCount < 1 ? true : (Math.random() < 0.5);
                    let nums;
                    if (wantCorrect) {
                        nums = [targetMode, targetMode, targetMode];
                        const used = new Set([targetMode]);
                        let s2 = 0;
                        while (nums.length < 6 && s2 < 50) {
                            s2++;
                            const v = randInt(1, 12);
                            if (used.has(v)) continue;
                            used.add(v);
                            nums.push(v);
                        }
                        nums = nums.sort(() => Math.random() - 0.5);
                    } else {
                        const otherPool = [2, 3, 4, 5, 6, 7, 8, 9].filter(n => n !== targetMode);
                        const otherMode = pick(otherPool);
                        nums = [otherMode, otherMode, otherMode];
                        const used = new Set([otherMode]);
                        let s2 = 0;
                        while (nums.length < 6 && s2 < 50) {
                            s2++;
                            const v = randInt(1, 12);
                            if (used.has(v) || v === targetMode) continue;
                            used.add(v);
                            nums.push(v);
                        }
                        nums = nums.sort(() => Math.random() - 0.5);
                    }
                    const counts = {};
                    nums.forEach(n => { counts[n] = (counts[n] || 0) + 1; });
                    let actualMode = null, maxC = 0;
                    for (const k of Object.keys(counts)) {
                        if (counts[k] > maxC) { maxC = counts[k]; actualMode = parseInt(k, 10); }
                    }
                    const isCorrect = actualMode === targetMode;
                    const key = nums.slice().sort((a, b) => a - b).join(',');
                    if (candidates.some(c => c.key === key)) continue;
                    if (isCorrect) correctCount++;
                    candidates.push({ nums, isCorrect, key });
                }
                if (candidates.length >= 3 && correctCount >= 1 && correctCount < candidates.length) {
                    const opts = candidates.map((c, i) => ({
                        id: 'opt' + i,
                        label: `{${c.nums.join(', ')}}`,
                        correct: c.isCorrect,
                    }));
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = `Click ALL data sets where the mode is ${targetMode}.`;
                    q.ans = ans;
                    q.options = _preserveOptionsForWidget(opts);
                    q.answerType = 'multi-select-check';
                    q.hint = `Mode is the value that appears most often.`;
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Mode';
                    return;
                }
            }

            if (dataSkill === "range" && Math.random() < 0.20) {
                const targetRange = pick([5, 6, 8, 10, 12, 15]);
                const numCandidates = randInt(4, 5);
                const candidates = [];
                let correctCount = 0;
                let safety = 0;
                while (candidates.length < numCandidates && safety < 200) {
                    safety++;
                    const wantCorrect = correctCount < 1 ? true : (Math.random() < 0.5);
                    let nums;
                    if (wantCorrect) {
                        const lo = randInt(1, 10);
                        const hi = lo + targetRange;
                        const middleCount = randInt(2, 3);
                        const middles = Array.from({ length: middleCount }, () => randInt(lo + 1, hi - 1));
                        nums = [lo, ...middles, hi].sort((a, b) => a - b);
                    } else {
                        nums = Array.from({ length: 5 }, () => randInt(1, 30)).sort((a, b) => a - b);
                        if (nums[nums.length - 1] - nums[0] === targetRange) continue;
                    }
                    const r = nums[nums.length - 1] - nums[0];
                    const isCorrect = r === targetRange;
                    const key = nums.slice().sort((a, b) => a - b).join(',');
                    if (candidates.some(c => c.key === key)) continue;
                    if (isCorrect) correctCount++;
                    candidates.push({ nums, isCorrect, key });
                }
                if (candidates.length >= 3 && correctCount >= 1 && correctCount < candidates.length) {
                    const opts = candidates.map((c, i) => ({
                        id: 'opt' + i,
                        label: `{${c.nums.join(', ')}}`,
                        correct: c.isCorrect,
                    }));
                    const ans = opts.filter(o => o.correct).map(o => o.id);
                    q.text = `Click ALL data sets where the range equals ${targetRange}.`;
                    q.ans = ans;
                    q.options = _preserveOptionsForWidget(opts);
                    q.answerType = 'multi-select-check';
                    q.hint = `Range = highest value − lowest value.`;
                    q.printFormat = 'multi-select';
                    q.skillLabel = 'Range';
                    return;
                }
            }

            if (dataSkill === "mean") {
                // Mean (average) - CCSS 5.MD
                const count = pick([4, 5, 6]);
                const nums = Array.from({length: count}, () => rng(2, Math.min(dataMax, 100)));
                const sum = nums.reduce((a, b) => a + b, 0);
                const mean = sum / count;

                q.ans = Number.isInteger(mean) ? mean : parseFloat(mean.toFixed(1));
                q.text = `Find the mean: ${nums.join(", ")}`;
                q.hint = `Mean = Sum of all values ÷ Number of values = ${sum} ÷ ${count}`;
                q.ccss = "5.MD.B.2";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Mean (Average)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:8px;margin:15px 0;flex-wrap:wrap;">
                        ${nums.map(n => `<span style="padding:10px 14px;background:linear-gradient(135deg, #4ECDC4, #45B7D1);color:white;border-radius:8px;font-weight:700;font-size:1.2rem;">${n}</span>`).join('')}
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:320px;border:2px solid var(--border-light);">
                        <div style="font-size:0.95rem;margin-bottom:8px;"><b>Step 1:</b> Add all values</div>
                        <div style="font-size:1rem;color:var(--accent-cyan);margin-bottom:8px;">${nums.join(' + ')} = ${sum}</div>
                        <div style="font-size:0.95rem;margin-bottom:8px;"><b>Step 2:</b> Divide by count (${count})</div>
                        <div style="font-size:1rem;">Mean = ${sum} ÷ ${count} = <span style="border-bottom:3px solid var(--accent-green);padding:2px 15px;font-weight:700;">?</span></div>
                    </div>
                </div>`;
                q.options = buildNumericOptions(q.ans);
                q.dataData = { nums, sum, mean: q.ans, type: 'mean' };
                q.printFormat = "data-mean";

            } else if (dataSkill === "median") {
                // Median - CCSS 5.MD.B.2
                const count = pick([5, 7, 9]);
                const nums = Array.from({length: count}, () => rng(1, Math.min(dataMax, 100))).sort((a, b) => a - b);
                const median = nums[Math.floor(count / 2)];

                q.ans = median;
                q.text = `Find the median: ${nums.join(", ")}`;
                q.hint = `Median is the middle number when in order. Cross off from both ends!`;
                q.ccss = "5.MD.B.2";

                const midIdx = Math.floor(count / 2);
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Median (Middle Value)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:6px;margin:15px 0;flex-wrap:wrap;align-items:center;">
                        ${nums.map((n, i) => `<span style="padding:10px 14px;background:${i === midIdx ? 'linear-gradient(135deg, #FF6B6B, #ee5a24)' : 'var(--bg-card)'};color:${i === midIdx ? 'white' : 'inherit'};border-radius:8px;font-weight:700;font-size:1.1rem;border:2px solid ${i === midIdx ? 'transparent' : 'var(--border-light)'};">${n}</span>`).join('<span style="color:var(--text-dim);">→</span>')}
                    </div>
                    <div style="margin-top:10px;padding:10px;background:var(--bg-card);border-radius:8px;display:inline-block;">
                        <span style="font-size:0.9rem;">Already ordered! Find the <b>middle</b> number (position ${midIdx + 1} of ${count})</span>
                    </div>
                </div>`;
                q.options = buildNumericOptions(median);
                q.dataData = { nums, median, type: 'median' };
                q.printFormat = "data-median";

            } else if (dataSkill === "mode") {
                // Mode - CCSS 5.MD.B.2
                const modeMax = Math.min(dataMax, 100);
                const mode = rng(3, modeMax);
                const modeCount = rng(3, 4);
                let nums = Array(modeCount).fill(mode);
                while (nums.length < modeCount + rng(4, 6)) {
                    const n = rng(1, modeMax);
                    if (n !== mode && nums.filter(x => x === n).length < 2) nums.push(n);
                }
                nums = nums.sort(() => Math.random() - 0.5);

                q.ans = mode;
                q.text = `Find the mode: ${nums.join(", ")}`;
                q.hint = `Mode is the number that appears most often. Count how many times each number appears!`;
                q.ccss = "5.MD.B.2";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Mode (Most Frequent)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:6px;margin:15px 0;flex-wrap:wrap;">
                        ${nums.map(n => `<span style="padding:10px 14px;background:${n === mode ? 'linear-gradient(135deg, #96CEB4, #45B7D1)' : 'var(--bg-card)'};color:${n === mode ? 'white' : 'inherit'};border-radius:8px;font-weight:700;font-size:1.1rem;border:2px solid ${n === mode ? 'transparent' : 'var(--border-light)'};">${n}</span>`).join('')}
                    </div>
                    <div style="margin-top:10px;padding:10px;background:var(--bg-card);border-radius:8px;display:inline-block;">
                        <span style="font-size:0.9rem;">Which number appears the <b>most</b> times?</span>
                    </div>
                </div>`;
                q.options = buildNumericOptions(mode);
                q.dataData = { nums, mode, modeCount, type: 'mode' };
                q.printFormat = "data-mode";

            } else if (dataSkill === "range") {
                // Range - CCSS 4.MD.B.4
                const nums = Array.from({length: rng(5, 8)}, () => rng(5, dataMax)).sort((a, b) => a - b);
                const range = nums[nums.length - 1] - nums[0];

                q.ans = range;
                q.text = `Find the range: ${nums.join(", ")}`;
                q.hint = `Range = Highest value - Lowest value = ${nums[nums.length-1]} - ${nums[0]}`;
                q.ccss = "4.MD.B.4";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">Range (Spread)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:6px;margin:15px 0;flex-wrap:wrap;">
                        ${nums.map((n, i) => `<span style="padding:10px 14px;background:${i === 0 ? 'linear-gradient(135deg, #45B7D1, #4ECDC4)' : i === nums.length-1 ? 'linear-gradient(135deg, #FF6B6B, #ee5a24)' : 'var(--bg-card)'};color:${i === 0 || i === nums.length-1 ? 'white' : 'inherit'};border-radius:8px;font-weight:700;font-size:1.1rem;">${n}</span>`).join('')}
                    </div>
                    <div style="background:var(--bg-card);padding:12px;border-radius:8px;margin-top:10px;display:inline-block;">
                        <span style="color:#45B7D1;font-weight:700;">Lowest: ${nums[0]}</span>
                        <span style="margin:0 15px;">→</span>
                        <span style="color:#FF6B6B;font-weight:700;">Highest: ${nums[nums.length-1]}</span>
                    </div>
                    <div style="margin-top:10px;font-size:1.1rem;">
                        Range = ${nums[nums.length-1]} - ${nums[0]} = <span style="border-bottom:3px solid var(--accent-green);padding:2px 15px;font-weight:700;">?</span>
                    </div>
                </div>`;
                q.options = buildNumericOptions(range);
                q.dataData = { nums, range, min: nums[0], max: nums[nums.length-1], type: 'range' };
                q.printFormat = "data-range";

            } else if (dataSkill === "bar_graph") {
                // Bar Graph - CCSS 3.MD.B.3
                const context = pick(contexts);
                const numBars = pick([4, 5]);
                const categories = context.categories.slice(0, numBars);
                const barMax = Math.max(5, Math.min(Math.ceil(dataMax / 5), 50));
                const values = categories.map(() => rng(2, barMax));
                const maxVal = Math.max(...values);

                // Phase 4.5 batch 6 — multi-select-check variant: "Click ALL bars > X"
                if (Math.random() < 0.20) {
                    // Pick a threshold so a non-trivial subset (1..numBars-1) of values is above it
                    const sortedVals = [...values].sort((a, b) => a - b);
                    // Try thresholds from middle outward
                    let chosenThreshold = null;
                    const tryOrder = [Math.floor(numBars / 2), 1, numBars - 2, 0, numBars - 1];
                    for (const ti of tryOrder) {
                        const t = sortedVals[ti];
                        const above = values.filter(v => v > t).length;
                        if (above >= 1 && above < numBars) { chosenThreshold = t; break; }
                    }
                    if (chosenThreshold !== null) {
                        const opts = categories.map((cat, i) => ({
                            id: 'opt' + i,
                            label: `${cat} (${values[i]})`,
                            correct: values[i] > chosenThreshold,
                        }));
                        const ans = opts.filter(o => o.correct).map(o => o.id);
                        // Build the same visual as the original branch
                        const barWidth = 40;
                        const barGap = 15;
                        const graphHeight = 140;
                        const graphWidth = categories.length * (barWidth + barGap) + 60;
                        const scale = (graphHeight - 30) / maxVal;
                        q.visual = `<div style="text-align:center;">
                            <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                            <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: 3.MD.B.3 | Bar Graph</div>
                            <svg width="${graphWidth}" height="${graphHeight + 40}" viewBox="0 0 ${graphWidth} ${graphHeight + 40}" style="display:block;margin:0 auto;">
                                <line x1="45" y1="10" x2="45" y2="${graphHeight}" stroke="var(--text-main)" stroke-width="2"/>
                                <line x1="45" y1="${graphHeight}" x2="${graphWidth - 10}" y2="${graphHeight}" stroke="var(--text-main)" stroke-width="2"/>
                                ${[0, Math.ceil(maxVal/2), maxVal].map((val) => `
                                    <text x="40" y="${graphHeight - val * scale + 5}" font-size="11" fill="var(--text-dim)" text-anchor="end">${val}</text>
                                    <line x1="43" y1="${graphHeight - val * scale}" x2="${graphWidth - 10}" y2="${graphHeight - val * scale}" stroke="var(--border-light)" stroke-width="1" stroke-dasharray="3"/>
                                `).join('')}
                                ${values.map((v, i) => {
                                    const x = 55 + i * (barWidth + barGap);
                                    const barHeight = v * scale;
                                    return `
                                        <rect x="${x}" y="${graphHeight - barHeight}" width="${barWidth}" height="${barHeight}"
                                              fill="${chartColors[i % chartColors.length]}" rx="4" ry="4"/>
                                        <text x="${x + barWidth/2}" y="${graphHeight - barHeight - 5}" font-size="12" fill="var(--text-main)" text-anchor="middle" font-weight="700">${v}</text>
                                        <text x="${x + barWidth/2}" y="${graphHeight + 15}" font-size="10" fill="var(--text-main)" text-anchor="middle">${categories[i].substring(0, 6)}</text>
                                    `;
                                }).join('')}
                            </svg>
                        </div>`;
                        q.text = `${context.title}: Click ALL categories with values greater than ${chosenThreshold}.`;
                        q.ans = ans;
                        q.options = _preserveOptionsForWidget(opts);
                        q.answerType = 'multi-select-check';
                        q.hint = `Read each bar's height and compare to ${chosenThreshold}.`;
                        q.printFormat = 'multi-select';
                        q.skillLabel = 'Bar Graph';
                        q.ccss = '3.MD.B.3';
                        q.dataData = { categories, values, context: context.title, threshold: chosenThreshold, type: 'bar_graph_msc' };
                        return;
                    }
                }

                const questionTypes = ["which_highest", "which_lowest", "specific_value", "total", "difference"];
                const questionType = pick(questionTypes);

                q.ccss = "3.MD.B.3";

                if (questionType === "which_highest") {
                    const maxIdx = values.indexOf(Math.max(...values));
                    q.ans = categories[maxIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which category has the most?`;
                } else if (questionType === "which_lowest") {
                    const minIdx = values.indexOf(Math.min(...values));
                    q.ans = categories[minIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which category has the least?`;
                } else if (questionType === "specific_value") {
                    const idx = rng(0, categories.length - 1);
                    q.ans = values[idx];
                    q.text = `${context.title}: How many chose ${categories[idx]}?`;
                    q.options = buildNumericOptions(q.ans);
                } else if (questionType === "total") {
                    q.ans = values.reduce((a, b) => a + b, 0);
                    q.text = `${context.title}: What is the total of all responses?`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const idx1 = rng(0, categories.length - 1);
                    let idx2 = rng(0, categories.length - 1);
                    while (idx2 === idx1) idx2 = rng(0, categories.length - 1);
                    q.ans = Math.abs(values[idx1] - values[idx2]);
                    q.text = `${context.title}: What is the difference between ${categories[idx1]} and ${categories[idx2]}?`;
                    q.options = buildNumericOptions(q.ans);
                }

                q.hint = `Read the bar graph carefully! Each bar shows a different value.`;

                // Create SVG bar graph
                const barWidth = 40;
                const barGap = 15;
                const graphHeight = 140;
                const graphWidth = categories.length * (barWidth + barGap) + 60;
                const scale = (graphHeight - 30) / maxVal;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Bar Graph</div>
                    <svg width="${graphWidth}" height="${graphHeight + 40}" viewBox="0 0 ${graphWidth} ${graphHeight + 40}" style="display:block;margin:0 auto;">
                        <!-- Y-axis -->
                        <line x1="45" y1="10" x2="45" y2="${graphHeight}" stroke="var(--text-main)" stroke-width="2"/>
                        <!-- X-axis -->
                        <line x1="45" y1="${graphHeight}" x2="${graphWidth - 10}" y2="${graphHeight}" stroke="var(--text-main)" stroke-width="2"/>
                        <!-- Y-axis labels -->
                        ${[0, Math.ceil(maxVal/2), maxVal].map((val, i) => `
                            <text x="40" y="${graphHeight - val * scale + 5}" font-size="11" fill="var(--text-dim)" text-anchor="end">${val}</text>
                            <line x1="43" y1="${graphHeight - val * scale}" x2="${graphWidth - 10}" y2="${graphHeight - val * scale}" stroke="var(--border-light)" stroke-width="1" stroke-dasharray="3"/>
                        `).join('')}
                        <!-- Bars -->
                        ${values.map((v, i) => {
                            const x = 55 + i * (barWidth + barGap);
                            const barHeight = v * scale;
                            return `
                                <rect x="${x}" y="${graphHeight - barHeight}" width="${barWidth}" height="${barHeight}"
                                      fill="${chartColors[i % chartColors.length]}" rx="4" ry="4"/>
                                <text x="${x + barWidth/2}" y="${graphHeight - barHeight - 5}" font-size="12" fill="var(--text-main)" text-anchor="middle" font-weight="700">${v}</text>
                                <text x="${x + barWidth/2}" y="${graphHeight + 15}" font-size="10" fill="var(--text-main)" text-anchor="middle">${categories[i].substring(0, 6)}</text>
                            `;
                        }).join('')}
                    </svg>
                </div>`;
                q.dataData = { categories, values, context: context.title, questionType, type: 'bar_graph' };
                q.printFormat = "data-bar-graph";

            } else if (dataSkill === "pictograph") {
                // Pictograph - CCSS 3.MD.B.3
                const context = pick(contexts);
                const numRows = pick([3, 4, 5]);
                const categories = context.categories.slice(0, numRows);
                const scaleOpts = range >= 100 ? [2, 5, 10, 25] : range >= 50 ? [2, 5, 10] : [2, 5];
                const scale = pick(scaleOpts);
                const pictoMax = Math.max(2, Math.min(Math.ceil(dataMax / scale), 8));
                const values = categories.map(() => rng(1, pictoMax) * scale);
                const icons = ["\u2605", "\u25CF", "\u25A0", "\u25B2", "\u2666"];
                const icon = pick(icons);

                // Phase 4.5 batch 6 (completion) — multi-select-check variant: "Click ALL categories with more than N items"
                if (Math.random() < 0.20) {
                    const sortedVals = [...values].sort((a, b) => a - b);
                    let chosenThreshold = null;
                    const tryOrder = [Math.floor(numRows / 2), 1, numRows - 2, 0, numRows - 1];
                    for (const ti of tryOrder) {
                        if (ti < 0 || ti >= sortedVals.length) continue;
                        const t = sortedVals[ti];
                        const above = values.filter(v => v > t).length;
                        if (above >= 1 && above < numRows) { chosenThreshold = t; break; }
                    }
                    if (chosenThreshold !== null) {
                        const opts = categories.map((cat, i) => ({
                            id: 'opt' + i,
                            label: `${cat} (${values[i]})`,
                            correct: values[i] > chosenThreshold,
                        }));
                        const ans = opts.filter(o => o.correct).map(o => o.id);
                        q.visual = `<div style="text-align:center;">
                            <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                            <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: 3.MD.B.3 | Pictograph</div>
                            <div style="background:var(--bg-card);padding:15px;border-radius:12px;display:inline-block;text-align:left;">
                                <div style="font-weight:600;margin-bottom:10px;text-align:center;padding:8px;background:var(--bg-card-light);border-radius:6px;">Key: ${icon} = ${scale}</div>
                                ${categories.map((cat, i) => {
                                    const numIcons = values[i] / scale;
                                    return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-light);">
                                        <span style="width:80px;font-weight:600;font-size:0.9rem;">${cat}</span>
                                        <span style="font-size:1.3rem;letter-spacing:4px;">${icon.repeat(numIcons)}</span>
                                    </div>`;
                                }).join('')}
                            </div>
                        </div>`;
                        q.text = `${context.title}: Click ALL categories with more than ${chosenThreshold} (Each ${icon} = ${scale}).`;
                        q.ans = ans;
                        q.options = _preserveOptionsForWidget(opts);
                        q.answerType = 'multi-select-check';
                        q.hint = `Count each row's symbols and multiply by ${scale}, then compare to ${chosenThreshold}.`;
                        q.printFormat = 'multi-select';
                        q.skillLabel = 'Pictograph';
                        q.ccss = '3.MD.B.3';
                        q.dataData = { categories, values, scale, icon, context: context.title, threshold: chosenThreshold, type: 'pictograph_msc' };
                        return;
                    }
                }

                const questionType = pick(["specific_value", "total", "which_most"]);
                q.ccss = "3.MD.B.3";

                if (questionType === "specific_value") {
                    const idx = rng(0, categories.length - 1);
                    q.ans = values[idx];
                    q.text = `${context.title}: How many for ${categories[idx]}? (Each ${icon} = ${scale})`;
                    q.options = buildNumericOptions(q.ans);
                } else if (questionType === "total") {
                    q.ans = values.reduce((a, b) => a + b, 0);
                    q.text = `${context.title}: What is the total? (Each ${icon} = ${scale})`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const maxIdx = values.indexOf(Math.max(...values));
                    q.ans = categories[maxIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which has the most? (Each ${icon} = ${scale})`;
                }

                q.hint = `Count the symbols and multiply by ${scale}!`;

                // Create pictograph
                const maxIcons = Math.ceil(Math.max(...values) / scale);
                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Pictograph</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;display:inline-block;text-align:left;">
                        <div style="font-weight:600;margin-bottom:10px;text-align:center;padding:8px;background:var(--bg-card-light);border-radius:6px;">Key: ${icon} = ${scale}</div>
                        ${categories.map((cat, i) => {
                            const numIcons = values[i] / scale;
                            return `<div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px solid var(--border-light);">
                                <span style="width:80px;font-weight:600;font-size:0.9rem;">${cat}</span>
                                <span style="font-size:1.3rem;letter-spacing:4px;">${icon.repeat(numIcons)}</span>
                            </div>`;
                        }).join('')}
                    </div>
                </div>`;
                q.dataData = { categories, values, scale, icon, context: context.title, type: 'pictograph' };
                q.printFormat = "data-pictograph";

            } else if (dataSkill === "line_plot") {
                // Line Plot with fractions - CCSS 4.MD.B.4, 5.MD.B.2
                const denominators = [4, 8];
                const denom = pick(denominators);
                const fractions = [];
                const counts = {};

                // Generate data points (lengths in fractions of an inch)
                for (let i = 0; i < rng(8, 12); i++) {
                    const num = rng(0, denom * 2);
                    const frac = num / denom;
                    fractions.push(frac);
                    counts[frac] = (counts[frac] || 0) + 1;
                }

                const uniqueFracs = Object.keys(counts).map(Number).sort((a, b) => a - b);
                const maxCount = Math.max(...Object.values(counts));

                const questionType = pick(["most_common", "total_points", "count_specific"]);
                q.ccss = denom === 4 ? "4.MD.B.4" : "5.MD.B.2";

                const formatFrac = (f) => {
                    if (f === Math.floor(f)) return String(f);
                    const whole = Math.floor(f);
                    const rem = f - whole;
                    const num = Math.round(rem * denom);
                    if (whole > 0) return `${whole} ${num}/${denom}`;
                    return `${num}/${denom}`;
                };

                if (questionType === "most_common") {
                    const maxFrac = Object.entries(counts).reduce((a, b) => b[1] > a[1] ? b : a);
                    q.ans = formatFrac(parseFloat(maxFrac[0]));
                    q.answerType = "choice";
                    q.options = uniqueFracs.slice(0, 4).map(f => formatFrac(f));
                    if (!q.options.includes(q.ans)) q.options[0] = q.ans;
                    q.text = `Plant Heights: Which measurement is most common?`;
                } else if (questionType === "total_points") {
                    q.ans = fractions.length;
                    q.text = `Plant Heights: How many plants were measured in total?`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const targetFrac = pick(uniqueFracs);
                    q.ans = counts[targetFrac];
                    q.text = `Plant Heights: How many plants measured ${formatFrac(targetFrac)} inches?`;
                    q.options = buildNumericOptions(q.ans);
                }

                q.hint = `Count the X marks above each measurement!`;

                // Create line plot SVG
                const plotWidth = 320;
                const plotHeight = 120;

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">Plant Heights (inches)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Line Plot</div>
                    <svg width="${plotWidth}" height="${plotHeight}" viewBox="0 0 ${plotWidth} ${plotHeight}" style="display:block;margin:0 auto;">
                        <!-- Number line -->
                        <line x1="20" y1="${plotHeight - 25}" x2="${plotWidth - 20}" y2="${plotHeight - 25}" stroke="var(--text-main)" stroke-width="2"/>
                        <!-- Tick marks and X's -->
                        ${uniqueFracs.map((frac, i) => {
                            const x = 30 + (frac / (Math.max(...uniqueFracs) + 0.5)) * (plotWidth - 60);
                            const count = counts[frac];
                            return `
                                <line x1="${x}" y1="${plotHeight - 30}" x2="${x}" y2="${plotHeight - 20}" stroke="var(--text-main)" stroke-width="2"/>
                                <text x="${x}" y="${plotHeight - 5}" font-size="10" fill="var(--text-main)" text-anchor="middle">${formatFrac(frac)}</text>
                                ${Array(count).fill(0).map((_, j) => `
                                    <text x="${x}" y="${plotHeight - 35 - j * 14}" font-size="14" fill="${chartColors[i % chartColors.length]}" text-anchor="middle" font-weight="700">×</text>
                                `).join('')}
                            `;
                        }).join('')}
                    </svg>
                </div>`;
                q.dataData = { fractions, counts, denom, type: 'line_plot' };
                q.printFormat = "data-line-plot";

            } else if (dataSkill === "tally_chart") {
                // Tally Chart - CCSS 3.MD.B.3
                const context = pick(contexts);
                const numRows = pick([3, 4, 5]);
                const categories = context.categories.slice(0, numRows);
                const values = categories.map(() => rng(3, 15));

                // Phase 4.5 batch 6 (completion) — multi-select-check variant: "Click ALL categories with at least N tallies"
                if (Math.random() < 0.20) {
                    const sortedVals = [...values].sort((a, b) => a - b);
                    let chosenThreshold = null;
                    const tryOrder = [Math.floor(numRows / 2), 1, numRows - 2, 0, numRows - 1];
                    for (const ti of tryOrder) {
                        if (ti < 0 || ti >= sortedVals.length) continue;
                        const t = sortedVals[ti];
                        const above = values.filter(v => v >= t).length;
                        if (above >= 1 && above < numRows) { chosenThreshold = t; break; }
                    }
                    if (chosenThreshold !== null) {
                        const opts = categories.map((cat, i) => ({
                            id: 'opt' + i,
                            label: `${cat} (${values[i]})`,
                            correct: values[i] >= chosenThreshold,
                        }));
                        const ans = opts.filter(o => o.correct).map(o => o.id);
                        // Reuse the tally-mark renderer (re-declared in scope to keep variant self-contained)
                        const makeTallyV = (n) => {
                            const groups = Math.floor(n / 5);
                            const extras = n % 5;
                            let result = '';
                            for (let i = 0; i < groups; i++) {
                                result += '<span style="position:relative;margin-right:10px;"><span style="letter-spacing:-2px;">||||</span><span style="position:absolute;left:0;top:50%;transform:rotate(-20deg);width:100%;">―</span></span>';
                            }
                            result += '<span style="letter-spacing:-2px;">' + '|'.repeat(extras) + '</span>';
                            return result;
                        };
                        q.visual = `<div style="text-align:center;">
                            <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                            <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: 3.MD.B.3 | Tally Chart</div>
                            <div style="background:var(--bg-card);padding:15px;border-radius:12px;display:inline-block;min-width:250px;">
                                <div style="display:grid;grid-template-columns:100px 1fr 50px;gap:5px;font-weight:600;padding-bottom:8px;border-bottom:2px solid var(--border-light);margin-bottom:8px;">
                                    <span>Category</span><span>Tallies</span><span>Count</span>
                                </div>
                                ${categories.map((cat, i) => `
                                    <div style="display:grid;grid-template-columns:100px 1fr 50px;gap:5px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
                                        <span style="font-weight:600;font-size:0.9rem;">${cat}</span>
                                        <span style="font-size:1.2rem;color:${chartColors[i % chartColors.length]};">${makeTallyV(values[i])}</span>
                                        <span style="font-weight:700;color:var(--accent-cyan);">${values[i]}</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>`;
                        q.text = `${context.title}: Click ALL categories with at least ${chosenThreshold} tallies.`;
                        q.ans = ans;
                        q.options = _preserveOptionsForWidget(opts);
                        q.answerType = 'multi-select-check';
                        q.hint = `Each "||||" group with a slash equals 5. Count tallies per row and compare to ${chosenThreshold}.`;
                        q.printFormat = 'multi-select';
                        q.skillLabel = 'Tally Chart';
                        q.ccss = '3.MD.B.3';
                        q.dataData = { categories, values, context: context.title, threshold: chosenThreshold, type: 'tally_chart_msc' };
                        return;
                    }
                }

                const questionType = pick(["specific_value", "total", "which_most"]);
                q.ccss = "3.MD.B.3";

                if (questionType === "specific_value") {
                    const idx = rng(0, categories.length - 1);
                    q.ans = values[idx];
                    q.text = `${context.title}: How many tallies for ${categories[idx]}?`;
                    q.options = buildNumericOptions(q.ans);
                } else if (questionType === "total") {
                    q.ans = values.reduce((a, b) => a + b, 0);
                    q.text = `${context.title}: What is the total of all tallies?`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const maxIdx = values.indexOf(Math.max(...values));
                    q.ans = categories[maxIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which has the most tallies?`;
                }

                q.hint = `Remember: |||| (crossed) = 5. Count groups of 5 plus extras!`;

                // Create tally marks
                const makeTally = (n) => {
                    const groups = Math.floor(n / 5);
                    const extras = n % 5;
                    let result = '';
                    for (let i = 0; i < groups; i++) {
                        result += '<span style="position:relative;margin-right:10px;"><span style="letter-spacing:-2px;">||||</span><span style="position:absolute;left:0;top:50%;transform:rotate(-20deg);width:100%;">―</span></span>';
                    }
                    result += '<span style="letter-spacing:-2px;">' + '|'.repeat(extras) + '</span>';
                    return result;
                };

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Tally Chart</div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;display:inline-block;min-width:250px;">
                        <div style="display:grid;grid-template-columns:100px 1fr 50px;gap:5px;font-weight:600;padding-bottom:8px;border-bottom:2px solid var(--border-light);margin-bottom:8px;">
                            <span>Category</span><span>Tallies</span><span>Count</span>
                        </div>
                        ${categories.map((cat, i) => `
                            <div style="display:grid;grid-template-columns:100px 1fr 50px;gap:5px;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-light);">
                                <span style="font-weight:600;font-size:0.9rem;">${cat}</span>
                                <span style="font-size:1.2rem;color:${chartColors[i % chartColors.length]};">${makeTally(values[i])}</span>
                                <span style="font-weight:700;color:var(--accent-cyan);">${values[i]}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>`;
                q.dataData = { categories, values, context: context.title, type: 'tally_chart' };
                q.printFormat = "data-tally";

            } else if (dataSkill === "pie_chart") {
                // Pie Chart - CCSS 5.MD.B.2
                const context = pick(contexts);
                const numSlices = pick([3, 4]);
                const categories = context.categories.slice(0, numSlices);

                // Generate percentages that add to 100
                let remaining = 100;
                const percents = [];
                for (let i = 0; i < numSlices - 1; i++) {
                    const p = rng(15, Math.min(40, remaining - 15 * (numSlices - i - 1)));
                    percents.push(p);
                    remaining -= p;
                }
                percents.push(remaining);

                const questionType = pick(["largest", "specific", "combined"]);
                q.ccss = "5.MD.B.2";

                if (questionType === "largest") {
                    const maxIdx = percents.indexOf(Math.max(...percents));
                    q.ans = categories[maxIdx];
                    q.answerType = "choice";
                    q.options = categories;
                    q.text = `${context.title}: Which category has the largest share?`;
                } else if (questionType === "specific") {
                    const idx = rng(0, categories.length - 1);
                    q.ans = percents[idx];
                    q.text = `${context.title}: What percent chose ${categories[idx]}?`;
                    q.options = buildNumericOptions(q.ans);
                } else {
                    const idx1 = 0, idx2 = 1;
                    q.ans = percents[idx1] + percents[idx2];
                    q.text = `${context.title}: What percent chose ${categories[idx1]} OR ${categories[idx2]} combined?`;
                    q.options = buildNumericOptions(q.ans);
                }

                q.hint = `Read the percentages shown in the pie chart!`;

                // Create pie chart SVG
                const cx = 100, cy = 100, r = 80;
                let currentAngle = -90; // Start at top

                const slices = percents.map((p, i) => {
                    const angle = (p / 100) * 360;
                    const startAngle = currentAngle;
                    const endAngle = currentAngle + angle;
                    currentAngle = endAngle;

                    const startRad = startAngle * Math.PI / 180;
                    const endRad = endAngle * Math.PI / 180;

                    const x1 = cx + r * Math.cos(startRad);
                    const y1 = cy + r * Math.sin(startRad);
                    const x2 = cx + r * Math.cos(endRad);
                    const y2 = cy + r * Math.sin(endRad);

                    const largeArc = angle > 180 ? 1 : 0;

                    const midAngle = (startAngle + endAngle) / 2 * Math.PI / 180;
                    const labelX = cx + (r * 0.65) * Math.cos(midAngle);
                    const labelY = cy + (r * 0.65) * Math.sin(midAngle);

                    return `
                        <path d="M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z"
                              fill="${chartColors[i]}" stroke="white" stroke-width="2"/>
                        <text x="${labelX}" y="${labelY}" font-size="12" fill="white" text-anchor="middle" font-weight="700">${p}%</text>
                    `;
                }).join('');

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">${context.icon} ${context.title}</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss} | Pie Chart</div>
                    <div style="display:flex;justify-content:center;align-items:center;gap:20px;flex-wrap:wrap;">
                        <svg width="200" height="200" viewBox="0 0 200 200">${slices}</svg>
                        <div style="text-align:left;">
                            ${categories.map((cat, i) => `
                                <div style="display:flex;align-items:center;gap:8px;margin:5px 0;">
                                    <span style="width:16px;height:16px;background:${chartColors[i]};border-radius:3px;"></span>
                                    <span style="font-size:0.9rem;">${cat} (${percents[i]}%)</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>`;
                q.dataData = { categories, percents, context: context.title, type: 'pie_chart' };
                q.printFormat = "data-pie";

            } else if (dataSkill === "line_plot_fractions") {
                // Line Plot with Fractions - CCSS 4.MD.B.4, 5.MD.B.2
                // Number line from 0 to maxWhole with fraction tick marks; X marks stacked above

                const denom = pick([2, 4, 8]);
                // Decide range: 0-1 or 0-2
                const maxWhole = pick([1, 2]);
                const totalTicks = maxWhole * denom + 1; // number of possible positions (inclusive)

                // Build array of possible fraction positions (as numerator over denom)
                const positions = []; // each entry: { num, denom, value }
                for (let n = 0; n <= maxWhole * denom; n++) {
                    positions.push({ num: n, denom, value: n / denom });
                }

                // Generate 8-15 data points
                const numPoints = rng(8, 15);
                const dataPoints = []; // array of position indices
                const countsByPos = {}; // key = position index, value = count
                for (let dp = 0; dp < numPoints; dp++) {
                    const idx = rng(0, positions.length - 1);
                    dataPoints.push(idx);
                    countsByPos[idx] = (countsByPos[idx] || 0) + 1;
                }

                // Helper to format a fraction position nicely
                const fmtFrac = (pos) => {
                    const val = pos.value;
                    if (val === Math.floor(val)) return String(Math.floor(val));
                    const whole = Math.floor(val);
                    const remNum = pos.num - whole * pos.denom;
                    // Simplify the fraction
                    const g = (a, b) => b === 0 ? a : g(b, a % b);
                    const gcdVal = g(remNum, pos.denom);
                    const sNum = remNum / gcdVal;
                    const sDenom = pos.denom / gcdVal;
                    if (whole > 0) return `${whole} ${sNum}/${sDenom}`;
                    return `${sNum}/${sDenom}`;
                };

                // Determine which positions actually have data
                const usedIndices = Object.keys(countsByPos).map(Number).sort((a, b) => a - b);
                const maxCount = Math.max(...Object.values(countsByPos));

                // Question types
                const qType = pick(["count_at", "total", "most_common"]);

                if (qType === "count_at") {
                    // "How many measurements are at X?"
                    const targetIdx = pick(usedIndices);
                    const targetLabel = fmtFrac(positions[targetIdx]);
                    q.ans = countsByPos[targetIdx];
                    q.text = `How many measurements are at ${targetLabel}?`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(q.ans);
                } else if (qType === "total") {
                    q.ans = numPoints;
                    q.text = `How many total measurements are there?`;
                    q.answerType = "number";
                    q.options = buildNumericOptions(q.ans);
                } else {
                    // most_common
                    let maxIdx = usedIndices[0];
                    for (const idx of usedIndices) {
                        if (countsByPos[idx] > countsByPos[maxIdx]) maxIdx = idx;
                    }
                    q.ans = fmtFrac(positions[maxIdx]);
                    q.answerType = "choice";
                    // Build options from used positions (up to 4)
                    const optionSet = usedIndices.slice(0, 4).map(idx => fmtFrac(positions[idx]));
                    if (!optionSet.includes(q.ans)) optionSet[0] = q.ans;
                    q.options = shuffle([...optionSet]);
                    q.text = `What is the most common measurement?`;
                }

                q.hint = `Count the X marks above each position on the number line!`;

                // --- Build SVG ---
                const svgW = 380;
                const svgH = 40 + maxCount * 16 + 40; // space for X stacks + line + labels
                const lineY = svgH - 35;
                const leftPad = 25;
                const rightPad = 25;
                const usableW = svgW - leftPad - rightPad;

                // Tick positions
                const tickSVGs = positions.map((pos, i) => {
                    const x = leftPad + (i / (positions.length - 1)) * usableW;
                    const label = fmtFrac(pos);
                    const count = countsByPos[i] || 0;
                    // X marks stacked above
                    const xMarks = Array.from({ length: count }, (_, j) =>
                        `<text x="${x}" y="${lineY - 12 - j * 15}" font-size="13" fill="#e74c3c" text-anchor="middle" font-weight="700">X</text>`
                    ).join('');
                    return `
                        <line x1="${x}" y1="${lineY - 5}" x2="${x}" y2="${lineY + 5}" stroke="var(--text-main)" stroke-width="1.5"/>
                        <text x="${x}" y="${lineY + 22}" font-size="${denom <= 4 ? 10 : 8}" fill="var(--text-main)" text-anchor="middle">${label}</text>
                        ${xMarks}
                    `;
                }).join('');

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">Line Plot (fractions)</div>
                    <svg width="${svgW}" height="${svgH}" viewBox="0 0 ${svgW} ${svgH}" style="display:block;margin:0 auto;">
                        <!-- Number line -->
                        <line x1="${leftPad}" y1="${lineY}" x2="${svgW - rightPad}" y2="${lineY}" stroke="var(--text-main)" stroke-width="2"/>
                        <!-- Arrow heads -->
                        <polygon points="${leftPad - 4},${lineY} ${leftPad + 4},${lineY - 4} ${leftPad + 4},${lineY + 4}" fill="var(--text-main)"/>
                        <polygon points="${svgW - rightPad + 4},${lineY} ${svgW - rightPad - 4},${lineY - 4} ${svgW - rightPad - 4},${lineY + 4}" fill="var(--text-main)"/>
                        ${tickSVGs}
                    </svg>
                    <div style="font-size:0.9rem;color:var(--text-dim);margin-top:6px;">Each X represents one measurement.</div>
                </div>`;

                q.printFormat = "line-plot-fractions";
                q.skillLabel = "Line Plot";
                q.dataData = { positions: positions.map(p => fmtFrac(p)), countsByPos, numPoints, denom, maxWhole, type: 'line_plot_fractions' };

            } else if (dataSkill === "probability") {
                // Phase 4.5 batch 6 (completion) — multi-select-check variant: "Click ALL events with prob > 1/2"
                if (Math.random() < 0.25) {
                    const eventPool = [
                        { desc: 'Rolling a 6 on a standard die', prob: 1/6 },
                        { desc: 'Drawing red from a bag of 4 red and 1 blue marble', prob: 4/5 },
                        { desc: 'Flipping heads on a fair coin', prob: 1/2 },
                        { desc: 'Rolling an even number on a standard die', prob: 1/2 },
                        { desc: 'Drawing a heart from a standard deck', prob: 1/4 },
                        { desc: 'Rolling 1 through 4 on a standard die', prob: 4/6 },
                        { desc: 'Drawing a king from a standard deck', prob: 4/52 },
                        { desc: 'Picking blue from a bag of 7 blue and 3 red marbles', prob: 7/10 },
                        { desc: 'Rolling a number greater than 1 on a standard die', prob: 5/6 },
                        { desc: 'Drawing a black card from a standard deck', prob: 26/52 }
                    ];
                    // Pick 5-6 events ensuring at least 1 above and 1 not above 1/2
                    let chosen = null;
                    let safety = 0;
                    while (!chosen && safety < 30) {
                        safety++;
                        const tryArr = shuffle([...eventPool]).slice(0, 5 + (Math.random() < 0.5 ? 0 : 1));
                        const above = tryArr.filter(e => e.prob > 0.5).length;
                        if (above >= 1 && above < tryArr.length) chosen = tryArr;
                    }
                    if (chosen) {
                        const opts = chosen.map((e, i) => ({
                            id: 'opt' + i,
                            label: e.desc,
                            correct: e.prob > 0.5,
                        }));
                        const ans = opts.filter(o => o.correct).map(o => o.id);
                        q.text = 'Click ALL events with probability greater than 1/2.';
                        q.ans = ans;
                        q.options = _preserveOptionsForWidget(opts);
                        q.answerType = 'multi-select-check';
                        q.hint = 'For each event, write the probability as a fraction and compare to 1/2 (which is 0.5).';
                        q.printFormat = 'multi-select';
                        q.skillLabel = 'Probability';
                        q.ccss = '7.SP.C.5';
                        return;
                    }
                }

                // Phase 4.5 batch 6 (completion) — dnd-categorize variant: sort events into Impossible/Unlikely/Likely/Certain
                if (Math.random() < 0.25) {
                    const eventPool = [
                        { desc: 'The sun will rise tomorrow', prob: 1.0 },
                        { desc: 'Flipping a coin and getting tails', prob: 0.5 },
                        { desc: 'A bird laying an egg the size of a basketball', prob: 0 },
                        { desc: 'Rolling a 1 or 2 on a standard die', prob: 1/3 },
                        { desc: 'Picking the only red ball from a bag of 5 red balls', prob: 1.0 },
                        { desc: 'Drawing a yellow card from a deck of only blue cards', prob: 0 },
                        { desc: 'Rolling a number from 1 to 6 on a standard die', prob: 1.0 },
                        { desc: 'Drawing a black marble from a bag of 9 white and 1 black', prob: 0.1 },
                        { desc: 'Picking a vowel from the letters A, E, I, O', prob: 1.0 },
                        { desc: 'Rolling a 7 on a standard 6-sided die', prob: 0 },
                        { desc: 'Drawing red from a bag of 5 red and 5 blue marbles', prob: 0.5 },
                        { desc: 'Pulling an odd number from cards labeled 1-10', prob: 0.5 },
                        { desc: 'Pulling a queen from a bag with 1 queen and 7 jacks', prob: 0.125 },
                        { desc: 'Drawing red from a bag of 8 red and 2 blue marbles', prob: 0.8 }
                    ];
                    // Categorize by likelihood: 0 = impossible, 0<p<0.5 = unlikely, 0.5<=p<1 = likely, p=1 = certain
                    const labelOf = (p) => {
                        if (p === 0) return 'impossible';
                        if (p < 0.5) return 'unlikely';
                        if (p < 1) return 'likely';
                        return 'certain';
                    };
                    // Pick 4-5 events spanning at least 2 distinct categories
                    let chosen = null;
                    let safety = 0;
                    while (!chosen && safety < 40) {
                        safety++;
                        const tryArr = shuffle([...eventPool]).slice(0, 4 + (Math.random() < 0.5 ? 0 : 1));
                        const labels = new Set(tryArr.map(e => labelOf(e.prob)));
                        if (labels.size >= 2) chosen = tryArr;
                    }
                    if (chosen) {
                        const tiles = chosen.map((e, i) => ({ id: 't' + i, label: e.desc }));
                        const bins = [
                            { id: 'impossible', label: 'Impossible' },
                            { id: 'unlikely', label: 'Unlikely' },
                            { id: 'likely', label: 'Likely' },
                            { id: 'certain', label: 'Certain' }
                        ];
                        const ans = {};
                        chosen.forEach((e, i) => { ans['t' + i] = labelOf(e.prob); });
                        q.text = 'Drag each event to the correct likelihood category.';
                        q.ans = ans;
                        q.tiles = tiles;
                        q.bins = bins;
                        q.answerType = 'dnd-generic';
                        q.dndMode = 'categorize';
                        q.hint = 'Impossible = can never happen. Certain = will always happen. Unlikely = less than half. Likely = more than half.';
                        q.options = [];
                        q.printFormat = 'dnd-generic';
                        q.skillLabel = 'Probability';
                        q.ccss = '7.SP.C.5';
                        return;
                    }
                }

                // Basic probability - CCSS 4.MD.B.4
                const scenarios = [
                    { item: "marble", container: "bag", colors: ["red", "blue", "green"], counts: [3, 4, 3], icons: ["\u25CF", "\u25CB", "\u25A0"] },
                    { item: "ball", container: "box", colors: ["yellow", "orange", "purple"], counts: [2, 5, 3], icons: ["\u25B2", "\u2666", "\u2605"] },
                    { item: "candy", container: "jar", colors: ["pink", "white", "brown"], counts: [4, 3, 3], icons: ["\u25CF", "\u25CB", "\u25A0"] }
                ];
                const scenario = pick(scenarios);
                const total = scenario.counts.reduce((a, b) => a + b, 0);
                // Guard against trivial probabilities (0/total or total/total)
                // Filter to indices where count is between 1 and total-1
                const validIndices = scenario.counts
                    .map((c, i) => ({ c, i }))
                    .filter(({ c }) => c > 0 && c < total)
                    .map(({ i }) => i);
                const favorableIdx = validIndices.length > 0 ? pick(validIndices) : rng(0, scenario.colors.length - 1);
                const favorable = scenario.colors[favorableIdx];
                let favorableCount = scenario.counts[favorableIdx];
                // Final guard: ensure non-trivial probability
                if (favorableCount <= 0) favorableCount = 1;
                if (favorableCount >= total) favorableCount = total - 1;

                q.text = `A ${scenario.container} has ${scenario.counts.map((c, i) => `${c} ${scenario.colors[i]}`).join(", ")} ${scenario.item}s. What is the probability of picking a ${favorable} one?`;
                q.ans = `${favorableCount}/${total}`;
                q.answerType = "text";
                q.hint = `Probability = Favorable outcomes / Total outcomes = ${favorableCount} / ${total}`;
                q.ccss = "4.MD.B.4";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">Probability</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="background:var(--bg-card);padding:20px;border-radius:16px;display:inline-block;margin:10px 0;">
                        <div style="font-size:2rem;letter-spacing:4px;margin-bottom:10px;">
                            ${scenario.counts.map((c, i) => scenario.icons[i].repeat(c)).join(' ')}
                        </div>
                        <div style="font-size:0.9rem;color:var(--text-dim);">
                            ${scenario.counts.map((c, i) => `${scenario.icons[i]} ${scenario.colors[i]}: ${c}`).join(' | ')}
                        </div>
                    </div>
                    <div style="margin-top:15px;font-size:1.1rem;">
                        P(${favorable}) = <span style="border:2px solid var(--accent-green);padding:5px 20px;border-radius:8px;font-weight:700;">?</span>
                    </div>
                    <div style="margin-top:10px;font-size:0.85rem;color:var(--text-dim);">Total ${scenario.item}s: ${total}</div>
                </div>`;
                q.dataData = { scenario, favorableCount, total, favorable, type: 'probability' };
                q.printFormat = "data-probability";
            }
            return;
}
