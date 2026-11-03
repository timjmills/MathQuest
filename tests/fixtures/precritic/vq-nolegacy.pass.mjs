// ws-visual-quality --rules VQ-NOLEGACY: OK. The same skill as a kit cell.
import { FF, FFS, ffsFixed } from './vq-common.mjs';
export default { skills: [{ ...FFS, items: FF.map(([a, b]) => ffsFixed(a, b)) }] };
