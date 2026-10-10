// node dump.mjs -> dump.json (live skills, current SKILL_WRM tags, WRM_PROPOSALS) and bl.json (build-list entries); read by gen.py
import fs from 'fs';
const _m=new Map();globalThis.localStorage={getItem:k=>_m.get(k)??null,setItem:(k,v)=>_m.set(k,String(v)),removeItem:k=>_m.delete(k)};globalThis.window=globalThis;
const root = new URL('../../../', import.meta.url).pathname, here = new URL('./', import.meta.url).pathname;
const { SKILLS } = await import(root + 'js/modules/data.js');
const { SKILL_WRM, WRM_PROPOSALS } = await import(root + 'js/modules/wrm.js');
const BL = await import(root + 'js/modules/build-list.js');
const skills = {};
for (const [c, arr] of Object.entries(SKILLS)) for (const s of arr) if (s && s.v && !s.retired && !/retired/i.test(s.l || '')) skills[`${c}:${s.v}`] = { label: s.l };
const tags = {};
for (const [k, arr] of Object.entries(SKILL_WRM)) for (const t of arr) { const o = typeof t === 'string' ? { step: t } : t; (tags[o.step] ||= []).push({ key: k, partial: o.partial ?? null }); }
const bl = {};
for (const [src, obj] of [['STANDARD_PROPOSALS', BL.STANDARD_PROPOSALS], ['WRM_EXTENSIONS', BL.WRM_EXTENSIONS], ['VISUAL_BUILDS', BL.VISUAL_BUILDS]])
  for (const [k, v] of Object.entries(obj || {})) if (!bl[k]) bl[k] = { ...v, _src: src };
fs.writeFileSync(here + 'dump.json', JSON.stringify({ skills, tags, props: WRM_PROPOSALS }));
fs.writeFileSync(here + 'bl.json', JSON.stringify(bl));
console.log('skills', Object.keys(skills).length, 'tagged steps', Object.keys(tags).length, 'props', Object.keys(WRM_PROPOSALS).length, 'bl', Object.keys(bl).length);
