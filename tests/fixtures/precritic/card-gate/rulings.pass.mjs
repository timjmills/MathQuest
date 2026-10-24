// PASS state: the same signed card; card.json is rewritten with its rulings and notOffered unchanged.
import { surface, clone, decided } from './base.mjs';
const c = decided();
export default { card: c, signedOn: '2026-10-23', atSign: { surface }, now: { card: clone(c) } };
