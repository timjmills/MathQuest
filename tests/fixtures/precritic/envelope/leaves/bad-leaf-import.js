// BAD: a declared data leaf that imports another module.
import { TABLE as BASE } from './good-leaf.js';
export const TABLE = Object.freeze({ ...BASE });
