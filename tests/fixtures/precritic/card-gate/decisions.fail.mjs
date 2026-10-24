// FAIL state (critic SU-C r2 N4): the signed card decides band and level but is silent about the inherited AP4
// notation control the panel offers (Stacked / Across), so nobody decided whether Across is offered and graded.
import { card, surface, clone } from './base.mjs';
export default { card: clone(card), signedOn: '2026-10-23', atSign: { surface } };
