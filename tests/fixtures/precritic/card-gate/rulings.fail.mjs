// FAIL state (W0-A critic r7 D2): after signing, card.json weakens a ruling (minuend 51-99 -> 0-999) and empties
// notOffered. Before the fix, `--rulings-only` refreshed bodySha over the new block and the signed card still passed.
import { surface, clone, decided } from './base.mjs';
const c = decided();
const weak = clone(c);
weak.rulings.rulings[0].min = 0;
weak.rulings.rulings[0].max = 999;
weak.rulings.notOffered = [];
export default { card: c, signedOn: '2026-10-23', atSign: { surface }, now: { card: weak } };
