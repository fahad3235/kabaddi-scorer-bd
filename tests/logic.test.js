/* Node unit tests for logic.js — run: node tests/logic.test.js */
const assert = require('node:assert');
const L = require('../logic.js');

let passed = 0;
function check(name, fn) {
  fn();
  passed += 1;
  console.log('ok - ' + name);
}

function fresh() {
  const res = L.createMatch('Dhaka', 'Chattogram', 5);
  assert.deepStrictEqual(res.errors, []);
  return res.match;
}
function tickTo(state, seconds) {
  let s = { ...state, running: true };
  for (let i = 0; i < seconds; i++) s = L.tick(s);
  return s;
}

/* --- scoring points per event type --- */
check('raid gives +1', () => {
  const r = L.applyEvent(fresh(), 'A', 'raid');
  assert.strictEqual(r.error, null);
  assert.strictEqual(r.state.scores.A, 1);
});
check('bonus gives +1', () => {
  const r = L.applyEvent(fresh(), 'B', 'bonus');
  assert.strictEqual(r.state.scores.B, 1);
});
check('tackle gives +1', () => {
  const r = L.applyEvent(fresh(), 'A', 'tackle');
  assert.strictEqual(r.state.scores.A, 1);
});
check('super tackle gives +2', () => {
  const r = L.applyEvent(fresh(), 'A', 'superTackle');
  assert.strictEqual(r.state.scores.A, 2);
});
check('all-out gives +2', () => {
  const r = L.applyEvent(fresh(), 'B', 'allOut');
  assert.strictEqual(r.state.scores.B, 2);
});
check('per-type counts tracked separately per team', () => {
  let s = fresh();
  s = L.applyEvent(s, 'A', 'raid').state;
  s = L.applyEvent(s, 'A', 'raid').state;
  s = L.applyEvent(s, 'A', 'superTackle').state;
  s = L.applyEvent(s, 'B', 'tackle').state;
  assert.strictEqual(s.counts.A.raid, 2);
  assert.strictEqual(s.counts.A.superTackle, 1);
  assert.strictEqual(s.counts.B.tackle, 1);
  assert.strictEqual(s.counts.B.raid, 0);
  assert.strictEqual(s.scores.A, 4);
});

/* --- undo restores exactly --- */
check('undo restores score, counts and log exactly', () => {
  let s = fresh();
  s = L.applyEvent(s, 'A', 'raid').state;
  s = L.applyEvent(s, 'A', 'allOut').state;
  const before = JSON.parse(JSON.stringify(s));
  s = L.applyEvent(s, 'B', 'superTackle').state;
  const undone = L.undoLastEvent(s);
  assert.strictEqual(undone.error, null);
  assert.deepStrictEqual(undone.state.scores, before.scores);
  assert.deepStrictEqual(undone.state.counts, before.counts);
  assert.deepStrictEqual(undone.state.log, before.log);
});
check('undo with empty stack errors', () => {
  const r = L.undoLastEvent(fresh());
  assert.strictEqual(r.error, 'nothing to undo');
});
check('hand-verified scenario: raid+1, tackle+1, all-out+2 = 4', () => {
  let s = fresh();
  s = L.applyEvent(s, 'A', 'raid').state;
  s = L.applyEvent(s, 'A', 'tackle').state;
  s = L.applyEvent(s, 'A', 'allOut').state;
  assert.strictEqual(s.scores.A, 4);
  assert.strictEqual(s.log.length, 3);
});

/* --- clock / half transitions --- */
check('clock ends half 1 at limit -> Half Time', () => {
  let s = tickTo(fresh(), 5 * 60);
  assert.strictEqual(s.phase, 'ht');
  assert.strictEqual(s.clockSec, 300);
  assert.strictEqual(s.running, false);
});
check('startSecondHalf then clock end -> Full Time', () => {
  let s = tickTo(fresh(), 5 * 60);
  s = L.startSecondHalf(s);
  assert.strictEqual(s.phase, '2nd');
  assert.strictEqual(s.clockSec, 0);
  s = tickTo(s, 5 * 60);
  assert.strictEqual(s.phase, 'ft');
});
check('scoring blocked at Full Time', () => {
  let s = tickTo(fresh(), 5 * 60);
  s = L.startSecondHalf(s);
  s = tickTo(s, 5 * 60);
  const r = L.applyEvent(s, 'A', 'raid');
  assert.notStrictEqual(r.error, null);
  assert.strictEqual(s.scores.A, 0);
});
check('endHalfEarly moves 1st -> ht and 2nd -> ft', () => {
  assert.strictEqual(L.endHalfEarly(fresh()).phase, 'ht');
  let s = tickTo(fresh(), 5 * 60);
  s = L.startSecondHalf(s);
  assert.strictEqual(L.endHalfEarly(s).phase, 'ft');
});

/* --- clock formatting --- */
check('formatClock zero-pads mm:ss', () => {
  assert.strictEqual(L.formatClock(0), '00:00');
  assert.strictEqual(L.formatClock(5), '00:05');
  assert.strictEqual(L.formatClock(65), '01:05');
  assert.strictEqual(L.formatClock(600), '10:00');
  assert.strictEqual(L.formatClock(1199), '19:59');
});

/* --- Bengali digits --- */
check('toBengaliDigits converts all digits', () => {
  assert.strictEqual(L.toBengaliDigits('0123456789'), '০১২৩৪৫৬৭৮৯');
  assert.strictEqual(L.toBengaliDigits('12:05'), '১২:০৫');
  assert.strictEqual(L.toBengaliDigits('Score 4'), 'Score ৪');
});

/* --- winner / tie --- */
check('winnerOf detects A win, B win, tie', () => {
  assert.strictEqual(L.winnerOf({ A: 4, B: 2 }), 'A');
  assert.strictEqual(L.winnerOf({ A: 1, B: 3 }), 'B');
  assert.strictEqual(L.winnerOf({ A: 2, B: 2 }), 'tie');
});

/* --- setup validation --- */
check('blank names default to Team A / Team B', () => {
  const res = L.createMatch('', '  ', 10);
  assert.deepStrictEqual(res.errors, []);
  assert.strictEqual(res.match.teamA, 'Team A');
  assert.strictEqual(res.match.teamB, 'Team B');
});
check('identical team names rejected', () => {
  assert.ok(L.validateSetup('Dhaka', 'dhaka', 10).length > 0);
});
check('invalid half length rejected', () => {
  assert.ok(L.validateSetup('A', 'B', 7).length > 0);
});

/* --- strict import: valid case --- */
const good = [{
  date: '2026-11-02T09:00:00.000Z', teamA: 'Dhaka', teamB: 'Chattogram',
  scoreA: 4, scoreB: 2, winner: 'A', halfLengthMin: 5,
}];
check('strict import accepts a valid record', () => {
  const r = L.parseHistoryImport(JSON.stringify(good));
  assert.strictEqual(r.error, null);
  assert.strictEqual(r.history.length, 1);
});

/* --- strict import: 8+ malformed cases rejected, data intact --- */
const malformed = [
  ['not JSON at all', 'invalid JSON'],
  ['{"not":"an array"}', 'not an array'],
  ['[42]', 'entry not an object'],
  ['[{"date":"nope","teamA":"A","teamB":"B","scoreA":1,"scoreB":0,"winner":"A","halfLengthMin":5}]', 'bad date'],
  ['[{"date":"2026-11-02T00:00:00.000Z","teamA":"","teamB":"B","scoreA":1,"scoreB":0,"winner":"A","halfLengthMin":5}]', 'empty teamA'],
  ['[{"date":"2026-11-02T00:00:00.000Z","teamA":"A","teamB":"B","scoreA":-1,"scoreB":0,"winner":"A","halfLengthMin":5}]', 'negative score'],
  ['[{"date":"2026-11-02T00:00:00.000Z","teamA":"A","teamB":"B","scoreA":1.5,"scoreB":0,"winner":"A","halfLengthMin":5}]', 'fractional score'],
  ['[{"date":"2026-11-02T00:00:00.000Z","teamA":"A","teamB":"B","scoreA":2,"scoreB":2,"winner":"A","halfLengthMin":5}]', 'winner mismatches scores'],
  ['[{"date":"2026-11-02T00:00:00.000Z","teamA":"A","teamB":"B","scoreA":1,"scoreB":0,"winner":"A","halfLengthMin":7}]', 'bad half length'],
  ['[{"date":"2026-11-02T00:00:00.000Z","teamA":"A","teamB":"B","scoreA":1,"scoreB":0,"winner":"A","halfLengthMin":5,"extra":1}]', 'unknown field'],
];
malformed.forEach(([text, label]) => {
  check('strict import rejects: ' + label, () => {
    const before = text;
    const r = L.parseHistoryImport(text);
    assert.notStrictEqual(r.error, null);
    assert.strictEqual(r.history, null);
    assert.strictEqual(text, before); // input untouched
  });
});

console.log('\n' + passed + ' tests passed, 0 failed.');
