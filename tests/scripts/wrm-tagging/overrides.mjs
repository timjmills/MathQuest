// Hand judgments layered on the generated defaults (existing SKILL_WRM tags + WRM_PROPOSALS + xlsx prior learning).
export const exclude = ['addition:equal_sign']; // deals plain column addition today (build-list equal_sign_repair); never offered as a pre/related skill
const cmpLen = 'comparing and ordering lengths given as measurements in cm and m with <, > and = (the skills compare pictured objects, no units)';
export const steps = {
  'Y2.B1.S2': { addPartial: [{ key: 'composing:base10_build', missing: 'grouping loose objects into tens to count them (the skill shows ready-made tens rods)' }],
    pre: [{ key: 'counting:count_objects', why: 'Y1.B1.S2 count objects to 10 one by one, the first step of counting by tens' }] },
  'Y2.B1.S16': { related: [
    { key: 'patterns:skip_count_line', why: 'the same skip count drawn as jumps on a number line' },
    { key: 'multiplication:count_by_tables', why: 'counting in 3s becomes the 3 times-table (Y3.B3.S8)' },
    { key: 'patterns:skip_count_grid', why: 'counting in 3s on a hundred square' }] },
  'Y2.B2.S1': { pre: [
    { key: 'composing:ten_frame_build', why: 'Y1 numbers to 10 on a ten frame: the picture a bond to 10 is read from' },
    { key: 'counting:count_objects', why: 'Y1.B1.S2 count to 10: a pupil must count the two parts' }] },
  'Y2.B2.S20': { remove: ['addition:equal_sign'], removeWhy: 'the skill deals plain column addition today (build-list equal_sign_repair); it does not compare two number sentences',
    verdict: 'gap', missing: 'comparing two number sentences (expression vs expression, e.g. 7 + 3 ○ 6 + 5) with <, > or =' },
  'Y2.B6.S3': { partial: { 'comparing:compare_objects': cmpLen, 'shapes_early:order_objects_length': cmpLen }, build: ['compare_lengths'] },
  'Y2.B6.S4': { partial: { 'shapes_early:order_objects_length': 'ordering lengths given as measurements in cm and m (the skill orders pictured objects)' }, build: ['compare_lengths'] },
  'Y2.B9.S3': { opts: { 'measurement:time_5min': { stimulus: 'words-past' } }, note: 'time_5min with the "words-past" stimulus reads and writes "20 past 3"' },
  'Y2.B9.S4': { opts: { 'measurement:time_5min': { stimulus: 'words-past' } }, note: 'time_5min with the "words-past" stimulus covers "10 to 4" (minutes to the hour)' },
  'Y3.B2.S21': { partial: { 'subtraction:sub_check_by_adding': 'checking an addition by subtracting, and finding a missing number with the inverse (the skill only checks a subtraction by adding)' }, build: ['inverse_check'] },
  'Y3.B3.S4': { pre: [
    { key: 'patterns:seq_5', why: 'Y2.B1.S15 count in 5s: the multiples of 5 are the 5s count' },
    { key: 'patterns:seq_10', why: 'Y2.B1.S15 count in 10s' },
    { key: 'multiplication:count_by_tables', why: 'Y2.B5.S13/S15 the 5 and 10 times-tables as a count' }] },
  'Y3.B10.S1': { pre: [{ key: 'measurement:time_hour', why: "Y2.B9.S1 o'clock: Roman numerals are met on a clock face" },
    { key: 'counting:number_seq_fill', why: 'ordering 1-12 before writing them as I-XII' }],
    related: [{ key: 'measurement:clock_parts', why: 'the parts of a clock face, where the Roman numerals stand' }] },
};
export const extendSteps = {
  compare_lengths: ['Y2.B6.S3', 'Y2.B6.S4'],
  inverse_check: ['Y3.B2.S21'],
};
export const proposals = {};
