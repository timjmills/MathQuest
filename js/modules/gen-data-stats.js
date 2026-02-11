// gen-data-stats.js - Data & Statistics question generation
import { state } from './state.js';
import { randInt, shuffle, pick, buildNumericOptions } from './utils.js';

export function generateDataStatsQuestion(q, mappedSkill, helpers) {
    const { rng, range, applyDecimals, ensureTables } = helpers;
            // Data & Statistics Category - CCSS Aligned for Grades 3-5
            const dataSkill = mappedSkill === "mixed" ? pick(["bar_graph", "line_plot", "pictograph", "tally_chart", "pie_chart", "mean", "median", "mode", "range", "probability"]) : mappedSkill;

            // Scale data values based on range (cap at 200 to keep mental math reasonable)
            const dataMax = Math.min(Math.max(range, 10), 200);

            // Real-world contexts for graphs
            const contexts = [
                { title: "Favorite Pets", categories: ["Dogs", "Cats", "Fish", "Birds", "Hamsters"], icon: "🐾" },
                { title: "Sports Played", categories: ["Soccer", "Baseball", "Basketball", "Tennis", "Swimming"], icon: "⚽" },
                { title: "Favorite Fruits", categories: ["Apples", "Bananas", "Oranges", "Grapes", "Strawberries"], icon: "🍎" },
                { title: "Weather This Week", categories: ["Mon", "Tue", "Wed", "Thu", "Fri"], icon: "🌤️" },
                { title: "Books Read", categories: ["Jan", "Feb", "Mar", "Apr", "May"], icon: "📚" }
            ];

            // Colors for charts
            const chartColors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'];

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
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📊 Mean (Average)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:8px;margin:15px 0;flex-wrap:wrap;">
                        ${nums.map(n => `<span style="padding:10px 14px;background:linear-gradient(135deg, #4ECDC4, #45B7D1);color:white;border-radius:8px;font-weight:700;font-size:1.2rem;">${n}</span>`).join('')}
                    </div>
                    <div style="background:var(--bg-card);padding:15px;border-radius:12px;margin:15px auto;max-width:320px;border:2px solid var(--border-light);">
                        <div style="font-size:0.95rem;margin-bottom:8px;">📝 <b>Step 1:</b> Add all values</div>
                        <div style="font-size:1rem;color:var(--accent-cyan);margin-bottom:8px;">${nums.join(' + ')} = ${sum}</div>
                        <div style="font-size:0.95rem;margin-bottom:8px;">📝 <b>Step 2:</b> Divide by count (${count})</div>
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
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📊 Median (Middle Value)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:6px;margin:15px 0;flex-wrap:wrap;align-items:center;">
                        ${nums.map((n, i) => `<span style="padding:10px 14px;background:${i === midIdx ? 'linear-gradient(135deg, #FF6B6B, #ee5a24)' : 'var(--bg-card)'};color:${i === midIdx ? 'white' : 'inherit'};border-radius:8px;font-weight:700;font-size:1.1rem;border:2px solid ${i === midIdx ? 'transparent' : 'var(--border-light)'};">${n}</span>`).join('<span style="color:var(--text-dim);">→</span>')}
                    </div>
                    <div style="margin-top:10px;padding:10px;background:var(--bg-card);border-radius:8px;display:inline-block;">
                        <span style="font-size:0.9rem;">✨ Already ordered! Find the <b>middle</b> number (position ${midIdx + 1} of ${count})</span>
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
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📊 Mode (Most Frequent)</div>
                    <div style="font-size:0.75rem;color:var(--text-dim);margin-bottom:10px;">CCSS: ${q.ccss}</div>
                    <div style="display:flex;justify-content:center;gap:6px;margin:15px 0;flex-wrap:wrap;">
                        ${nums.map(n => `<span style="padding:10px 14px;background:${n === mode ? 'linear-gradient(135deg, #96CEB4, #45B7D1)' : 'var(--bg-card)'};color:${n === mode ? 'white' : 'inherit'};border-radius:8px;font-weight:700;font-size:1.1rem;border:2px solid ${n === mode ? 'transparent' : 'var(--border-light)'};">${n}</span>`).join('')}
                    </div>
                    <div style="margin-top:10px;padding:10px;background:var(--bg-card);border-radius:8px;display:inline-block;">
                        <span style="font-size:0.9rem;">🔍 Which number appears the <b>most</b> times?</span>
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
                    <div style="font-weight:700;margin-bottom:10px;color:var(--accent-purple);">📊 Range (Spread)</div>
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
                const icons = ["⭐", "🔵", "🍎", "📚", "🎈"];
                const icon = pick(icons);

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
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">🌱 Plant Heights (inches)</div>
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
                // Basic probability - CCSS 4.MD.B.4
                const scenarios = [
                    { item: "marble", container: "bag", colors: ["red", "blue", "green"], counts: [3, 4, 3], icons: ["🔴", "🔵", "🟢"] },
                    { item: "ball", container: "box", colors: ["yellow", "orange", "purple"], counts: [2, 5, 3], icons: ["🟡", "🟠", "🟣"] },
                    { item: "candy", container: "jar", colors: ["pink", "white", "brown"], counts: [4, 3, 3], icons: ["🩷", "⚪", "🟤"] }
                ];
                const scenario = pick(scenarios);
                const total = scenario.counts.reduce((a, b) => a + b, 0);
                const favorableIdx = rng(0, scenario.colors.length - 1);
                const favorable = scenario.colors[favorableIdx];
                const favorableCount = scenario.counts[favorableIdx];

                q.text = `A ${scenario.container} has ${scenario.counts.map((c, i) => `${c} ${scenario.colors[i]}`).join(", ")} ${scenario.item}s. What is the probability of picking a ${favorable} one?`;
                q.ans = `${favorableCount}/${total}`;
                q.answerType = "text";
                q.hint = `Probability = Favorable outcomes / Total outcomes = ${favorableCount} / ${total}`;
                q.ccss = "4.MD.B.4";

                q.visual = `<div style="text-align:center;">
                    <div style="font-weight:700;margin-bottom:8px;color:var(--accent-purple);">🎲 Probability</div>
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
