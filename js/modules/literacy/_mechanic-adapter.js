// _mechanic-adapter.js — Cross-generator mechanic fallback.
//
// Generators call this when their dispatcher picks a mechanic the generator
// doesn't have a specialized branch for. The adapter wraps an existing
// mc-text question into the requested widget shape so atoms reliably produce
// ≥3 distinct dispatcher-handled mechanics from the data file's question_types.
//
// Why this is safe: every wrapped question still references the same correct
// answer; only the *interaction surface* changes. Auto-grade still works.

function _qid(skillId, mech) {
    return `${skillId}_${mech}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function _correctOption(q) {
    if (!q || !Array.isArray(q.options)) return null;
    const ans = q.ans || q.correct_answer;
    return q.options.find(o => o.id === ans) || q.options[0];
}

function _label(o) {
    return (o && (o.label != null ? o.label : (o.text != null ? o.text : ''))) || '';
}

/**
 * Wrap an mc-text question into the requested mechanic shape.
 * Returns the wrapped question, or the original if no wrap is implemented.
 *
 * @param {Object} baseQ  An mc-text question already constructed by the generator.
 * @param {string} mechanic  The mechanic id requested by the dispatcher.
 * @returns {Object} A new question object using the requested widget.
 */
export function adaptMechanic(baseQ, mechanic) {
    if (!baseQ || !mechanic) return baseQ;
    if (baseQ.question_type === mechanic) return baseQ;

    const correct = _correctOption(baseQ);
    if (!correct) return baseQ;

    const skillIds = baseQ.skill_ids || [];
    const skillId  = skillIds[0] || 'unknown';
    const skillAtom = baseQ.skill_atom || null;

    switch (mechanic) {
        case 'mc-audio':
            // Same options + ans; widget reads them aloud.
            return {
                ...baseQ,
                id: _qid(skillId, 'mcaudio'),
                question_type: 'mc-audio',
                has_audio: true,
            };

        case 'two-button-binary': {
            // Reframe: "Is this the answer?" with the correct option as the yes-target.
            const candidate = correct;
            return {
                id: _qid(skillId, 'tbb'),
                skill_ids: skillIds,
                skill_atom: skillAtom,
                question_type: 'two-button-binary',
                stem: `${baseQ.stem || 'Question'}\n\nIs the answer "${_label(candidate)}"?`,
                ans: 'yes',
                correct_answer: 'yes',
                yes_label: 'Yes',
                no_label: 'No',
                hints: baseQ.hints || [],
                rit_difficulty: baseQ.rit_difficulty || 150,
                grade_level: baseQ.grade_level || 'K-1',
                has_audio: true,
                k2_appropriate: !!baseQ.k2_appropriate,
            };
        }

        case 'sort-into-bins': {
            // 2-bin sort: every option lands in "Correct" or "Not Correct" bin.
            const items = (baseQ.options || []).map(o => ({ id: o.id, text: _label(o) }));
            const bins = [
                { id: 'correct', label: 'Correct answer' },
                { id: 'other',   label: 'Other choices' },
            ];
            const correct_assignment = {};
            for (const o of (baseQ.options || [])) {
                correct_assignment[o.id] = (o.id === correct.id) ? 'correct' : 'other';
            }
            return {
                id: _qid(skillId, 'sib'),
                skill_ids: skillIds,
                skill_atom: skillAtom,
                question_type: 'sort-into-bins',
                stem: baseQ.stem || 'Sort each item into the correct bin.',
                items,
                bins,
                correct_assignment,
                hints: baseQ.hints || [],
                rit_difficulty: baseQ.rit_difficulty || 150,
                grade_level: baseQ.grade_level || 'K-1',
                has_audio: true,
                k2_appropriate: !!baseQ.k2_appropriate,
            };
        }

        case 'tap-hotspot': {
            // Lay out options in a 2x2 grid; correct option is the target hotspot.
            const opts = baseQ.options || [];
            const hotspots = opts.map((o, i) => ({
                id: o.id,
                x: 25 + (i % 2) * 50,
                y: 25 + Math.floor(i / 2) * 50,
                radius: 18,
                label: _label(o),
                is_target: o.id === correct.id,
            }));
            return {
                id: _qid(skillId, 'tap'),
                skill_ids: skillIds,
                skill_atom: skillAtom,
                question_type: 'tap-hotspot',
                stem: baseQ.stem || 'Tap the correct answer.',
                image: null,
                hotspots,
                ans: correct.id,
                correct_answer: correct.id,
                hints: baseQ.hints || [],
                rit_difficulty: baseQ.rit_difficulty || 150,
                grade_level: baseQ.grade_level || 'K-1',
                has_audio: true,
                k2_appropriate: !!baseQ.k2_appropriate,
            };
        }

        case 'match-pairs': {
            // Match each option to its label; trivial in this fallback (all options
            // pair with themselves) so use this only when the generator can't supply
            // a richer match. Better than coming-soon but pedagogically thin.
            const opts = baseQ.options || [];
            if (opts.length < 2) return baseQ;
            const left  = opts.map(o => ({ id: 'L_' + o.id, text: _label(o) }));
            const right = opts.map(o => ({ id: 'R_' + o.id, text: _label(o) }));
            const correct_pairs = opts.map(o => ['L_' + o.id, 'R_' + o.id]);
            return {
                id: _qid(skillId, 'mp'),
                skill_ids: skillIds,
                skill_atom: skillAtom,
                question_type: 'match-pairs',
                stem: baseQ.stem || 'Match each item.',
                left_items: left,
                right_items: right,
                correct_pairs,
                hints: baseQ.hints || [],
                rit_difficulty: baseQ.rit_difficulty || 150,
                grade_level: baseQ.grade_level || 'K-1',
                has_audio: false,
                k2_appropriate: !!baseQ.k2_appropriate,
            };
        }

        default:
            return baseQ;
    }
}
