/* Kabaddi Scorer BD — pure logic.
 * No DOM access here. Works in the browser (window.KabaddiLogic)
 * and in Node (module.exports). */

'use strict';

const EVENT_TYPES = ['raid', 'bonus', 'tackle', 'superTackle', 'allOut'];

const EVENT_POINTS = {
  raid: 1,
  bonus: 1,
  tackle: 1,
  superTackle: 2,
  allOut: 2,
};

const HALF_LENGTHS = [20, 15, 10, 5];

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

function emptyCounts() {
  const c = {};
  for (const t of EVENT_TYPES) c[t] = 0;
  return c;
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/* ---------- Match setup / validation ---------- */

function normalizeTeamName(name, fallback) {
  const trimmed = (name || '').trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function validateSetup(teamA, teamB, halfLengthMin) {
  const errors = [];
  const a = (teamA || '').trim();
  const b = (teamB || '').trim();
  if (a.length > 30) errors.push('teamA too long (max 30 characters)');
  if (b.length > 30) errors.push('teamB too long (max 30 characters)');
  if (a.length > 0 && b.length > 0 && a.toLowerCase() === b.toLowerCase()) {
    errors.push('team names must be different');
  }
  if (!HALF_LENGTHS.includes(Number(halfLengthMin))) {
    errors.push('half length must be one of 20, 15, 10, or 5 minutes');
  }
  return errors;
}

function createMatch(teamA, teamB, halfLengthMin) {
  const errors = validateSetup(teamA, teamB, halfLengthMin);
  if (errors.length > 0) return { errors };
  return {
    match: {
      teamA: normalizeTeamName(teamA, 'Team A'),
      teamB: normalizeTeamName(teamB, 'Team B'),
      halfLengthMin: Number(halfLengthMin),
      phase: '1st', // '1st' | 'ht' | '2nd' | 'ft'
      clockSec: 0,
      running: false,
      scores: { A: 0, B: 0 },
      counts: { A: emptyCounts(), B: emptyCounts() },
      log: [],
      undoStack: [],
    },
    errors: [],
  };
}

/* ---------- Clock ---------- */

function formatClock(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return String(m).padStart(2, '0') + ':' + String(r).padStart(2, '0');
}

function phaseLabel(phase) {
  if (phase === '1st') return '1st Half';
  if (phase === 'ht') return 'Half Time';
  if (phase === '2nd') return '2nd Half';
  return 'Full Time';
}

/* Advance the clock by one second. Returns a NEW state object.
 * At the end of half 1 the phase becomes Half Time; at the end of
 * half 2 it becomes Full Time. The clock stops at the half limit. */
function tick(state) {
  const next = deepCopy(state);
  if (next.phase !== '1st' && next.phase !== '2nd') return next;
  if (!next.running) return next;
  const limit = next.halfLengthMin * 60;
  next.clockSec += 1;
  if (next.clockSec >= limit) {
    next.clockSec = limit;
    next.running = false;
    next.phase = next.phase === '1st' ? 'ht' : 'ft';
  }
  return next;
}

function startSecondHalf(state) {
  const next = deepCopy(state);
  if (next.phase !== 'ht') return next;
  next.phase = '2nd';
  next.clockSec = 0;
  next.running = false;
  return next;
}

function endHalfEarly(state) {
  const next = deepCopy(state);
  if (next.phase === '1st') {
    next.phase = 'ht';
    next.clockSec = next.halfLengthMin * 60;
    next.running = false;
  } else if (next.phase === '2nd') {
    next.phase = 'ft';
    next.clockSec = next.halfLengthMin * 60;
    next.running = false;
  }
  return next;
}

/* ---------- Scoring ---------- */

function applyEvent(state, team, type) {
  if (team !== 'A' && team !== 'B') return { state, error: 'team must be A or B' };
  if (!EVENT_TYPES.includes(type)) return { state, error: 'unknown event type' };
  if (state.phase === 'ft') return { state, error: 'match is over' };
  const next = deepCopy(state);
  next.undoStack.push(deepCopy(state));
  const pts = EVENT_POINTS[type];
  next.scores[team] += pts;
  next.counts[team][type] += 1;
  next.log.push({
    team,
    type,
    points: pts,
    clockSec: next.clockSec,
    phase: next.phase,
  });
  return { state: next, error: null };
}

/* Undo the last event, restoring scores, counts and log exactly. */
function undoLastEvent(state) {
  if (!state.undoStack || state.undoStack.length === 0) {
    return { state, error: 'nothing to undo' };
  }
  const prev = deepCopy(state.undoStack[state.undoStack.length - 1]);
  prev.undoStack = state.undoStack.slice(0, -1);
  return { state: prev, error: null };
}

function winnerOf(scores) {
  if (scores.A > scores.B) return 'A';
  if (scores.B > scores.A) return 'B';
  return 'tie';
}

function finishMatchRecord(state, isoDate) {
  const winner = winnerOf(state.scores);
  return {
    date: isoDate || new Date().toISOString(),
    teamA: state.teamA,
    teamB: state.teamB,
    scoreA: state.scores.A,
    scoreB: state.scores.B,
    winner,
    halfLengthMin: state.halfLengthMin,
  };
}

/* ---------- Bengali digits ---------- */

function toBengaliDigits(text) {
  return String(text).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

/* ---------- Strict history import ---------- */

function isPlainObject(v) {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

function validateHistoryEntry(entry) {
  if (!isPlainObject(entry)) return 'entry must be an object';
  const keys = Object.keys(entry);
  const allowed = ['date', 'teamA', 'teamB', 'scoreA', 'scoreB', 'winner', 'halfLengthMin'];
  for (const k of keys) {
    if (!allowed.includes(k)) return 'unknown field: ' + k;
  }
  if (typeof entry.date !== 'string' || Number.isNaN(Date.parse(entry.date))) {
    return 'date must be a valid date string';
  }
  if (typeof entry.teamA !== 'string' || entry.teamA.trim().length === 0) {
    return 'teamA must be a non-empty string';
  }
  if (typeof entry.teamB !== 'string' || entry.teamB.trim().length === 0) {
    return 'teamB must be a non-empty string';
  }
  if (!Number.isInteger(entry.scoreA) || entry.scoreA < 0) {
    return 'scoreA must be a non-negative integer';
  }
  if (!Number.isInteger(entry.scoreB) || entry.scoreB < 0) {
    return 'scoreB must be a non-negative integer';
  }
  if (!['A', 'B', 'tie'].includes(entry.winner)) {
    return 'winner must be A, B, or tie';
  }
  if (entry.winner !== winnerOf({ A: entry.scoreA, B: entry.scoreB })) {
    return 'winner does not match the scores';
  }
  if (!HALF_LENGTHS.includes(entry.halfLengthMin)) {
    return 'halfLengthMin must be one of 20, 15, 10, or 5';
  }
  return null;
}

/* Returns { history, error }. On any error the caller's data is
 * untouched — this function never mutates its input. */
function parseHistoryImport(jsonText) {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch (e) {
    return { history: null, error: 'invalid JSON: ' + e.message };
  }
  if (!Array.isArray(data)) return { history: null, error: 'import must be a JSON array' };
  for (let i = 0; i < data.length; i++) {
    const err = validateHistoryEntry(data[i]);
    if (err) return { history: null, error: 'entry ' + i + ': ' + err };
  }
  return { history: data, error: null };
}

const KabaddiLogic = {
  EVENT_TYPES,
  EVENT_POINTS,
  HALF_LENGTHS,
  createMatch,
  validateSetup,
  normalizeTeamName,
  formatClock,
  phaseLabel,
  tick,
  startSecondHalf,
  endHalfEarly,
  applyEvent,
  undoLastEvent,
  winnerOf,
  finishMatchRecord,
  toBengaliDigits,
  validateHistoryEntry,
  parseHistoryImport,
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = KabaddiLogic;
}
if (typeof window !== 'undefined') {
  window.KabaddiLogic = KabaddiLogic;
}
