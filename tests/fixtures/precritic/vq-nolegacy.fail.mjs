// ws-visual-quality --rules VQ-NOLEGACY: FAIL. A skill built new as a legacy _wsCell (RC5: fact_family_sort, 2026-10-24).
import { FF, FFS, ffsBase } from './vq-common.mjs';
export default { skills: [{ ...FFS, items: FF.map(([a, b]) => ffsBase(a, b)) }] };
