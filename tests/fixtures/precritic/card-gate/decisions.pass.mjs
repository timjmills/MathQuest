// PASS state (fix r2): the card decides the notation control (hidden: always stacked) and the `lengths` option it
// asks for (offered); a correct build then adds `lengths`: still green.
import { surface, clone, decided } from './base.mjs';
const c = decided();
c.decisions.options.push({ option: 'lengths', values: ['same', 'shorter'], d: 'offered', source: '§9.3' });
const now = clone(surface);
now.options.push(...['lengths=same', 'lengths=shorter'].map((key) => ({ key, skills: ['subtraction:sub_100_no_regroup'], text: '' })));
export default { card: c, signedOn: '2026-10-23', atSign: { surface }, now: { surface: now } };
