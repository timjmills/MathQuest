// ws-visual-quality --rules VQ-ONEANSWER: OK. The same cell with the Say frame moved to the model: one answer, the ticks.
import { FF, FFS, ffsNoSay } from './vq-common.mjs';
export default { skills: [{ ...FFS, items: FF.map(([a, b]) => ffsNoSay(a, b)) }] };
