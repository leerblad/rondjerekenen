// ─── Operation types ──────────────────────────────────────────────────────────

export type Operation = "plus" | "min" | "keer" | "deel" | "pct";

export const OPERATIONS: Operation[] = ["plus", "min", "keer", "deel", "pct"];

export const OPERATION_LABELS: Record<Operation, string> = {
  plus: "Plus",
  min: "Min",
  keer: "Keer",
  deel: "Deel",
  pct: "Procent",
};

export const OPERATION_SYMBOLS: Record<Operation, string> = {
  plus: "+",
  min: "−",
  keer: "×",
  deel: "÷",
  pct: "%",
};

// ─── Stages (7 phases × 20 levels = 140 total) ───────────────────────────────

export type Stage =
  | "g4"           // Groep 4: +/- t/m 20, tafels 2/5/10, halveren, splitsingen
  | "g5_plus_min"  // Groep 5: +/- t/m 100
  | "g5_tafels"    // Groep 5: tafels 1-10 + deeltafels 1-10
  | "g6_tafels"    // Groep 6: alle tafels/deeltafels + hogere tafels (3s→2s)
  | "g6_sommen"    // Groep 6: grotere sommen t/m 50, minsommen vanaf 50
  | "g7"           // Groep 7: sommen t/m 100, minsommen vanaf 100, hogere tafels
  | "g8";          // Groep 8: sommen t/m 1000, percentages

export const STAGES: Stage[] = [
  "g4", "g5_plus_min", "g5_tafels", "g6_tafels", "g6_sommen", "g7", "g8",
];

export const STAGE_LABELS: Record<Stage, string> = {
  g4:          "Groep 4",
  g5_plus_min: "Groep 5 — Optellen & Aftrekken",
  g5_tafels:   "Groep 5 — Tafels",
  g6_tafels:   "Groep 6 — Tafels snel",
  g6_sommen:   "Groep 6 — Grotere sommen",
  g7:          "Groep 7",
  g8:          "Groep 8",
};

// Short label for display in the portal stage picker
export const STAGE_SHORT_LABELS: Record<Stage, string> = {
  g4:          "Groep 4",
  g5_plus_min: "Groep 5 +/−",
  g5_tafels:   "Groep 5 ×÷",
  g6_tafels:   "Groep 6 tafels",
  g6_sommen:   "Groep 6 sommen",
  g7:          "Groep 7",
  g8:          "Groep 8",
};

export const LEVELS_PER_STAGE = 20;
export const MAX_LEVEL = STAGES.length * LEVELS_PER_STAGE; // 140
export const QUESTIONS_PER_LEVEL = 20;
export const SESSION_SECONDS = 600; // 10 minutes
export const BONUS_TIME_LIMIT = 2000; // 2s per question in bonus mode
export const UNLOCK_THRESHOLD = 0.95; // 95% to advance

/** Global level (1-140) → which stage */
export function levelToStage(level: number): Stage {
  const idx = Math.min(
    Math.floor((Math.max(1, level) - 1) / LEVELS_PER_STAGE),
    STAGES.length - 1
  );
  return STAGES[idx];
}

/** Global level (1-140) → position within the current stage (1-20) */
export function withinStageLevel(level: number): number {
  return ((Math.max(1, level) - 1) % LEVELS_PER_STAGE) + 1;
}

// ─── Time limits ──────────────────────────────────────────────────────────────

/**
 * Time per question in ms.
 * g6_tafels: 3000ms → 2000ms (tafels must be fast)
 * all others: 6000ms → 3000ms
 */
export function getTimeLimit(level: number): number {
  const stage = levelToStage(level);
  const wl = withinStageLevel(level);
  if (stage === "g6_tafels") {
    return Math.round(3000 - (wl - 1) * (1000 / 19));
  }
  return Math.round(6000 - (wl - 1) * (3000 / 19));
}

// ─── Question type ────────────────────────────────────────────────────────────

export type Question = {
  question: string;
  answer: number;
  operation: Operation;
  a: number;
  b: number;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Biased random: wl=1 → small numbers, wl=20 → uniform up to max */
function biasedRnd(max: number, wl: number): number {
  const power = 3 - (wl - 1) * (2 / 19);
  return Math.min(max, Math.floor(Math.pow(Math.random(), power) * (max + 1)));
}

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Groep 4 generators ───────────────────────────────────────────────────────
// +/- t/m 20, tafels 2/5/10, halveren t/m 20, splitsingen t/m 10

function makeG4Plus(wl: number): Question {
  // a + b ≤ 20, biased small at low wl
  const max = Math.round(5 + (wl - 1) * (15 / 19)); // max grows from 5 to 20
  const a = rnd(0, max);
  const b = rnd(0, Math.min(max - a, max));
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG4Min(wl: number): Question {
  const max = Math.round(5 + (wl - 1) * (15 / 19));
  const a = rnd(1, max);
  const b = rnd(0, a);
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG4Tafel(wl: number): Question {
  const tafels = [2, 5, 10];
  const b = pickFrom(tafels);
  const maxA = Math.round(2 + (wl - 1) * (8 / 19)); // 2 to 10
  const a = rnd(1, maxA);
  return { question: `${a} × ${b} = ?`, answer: a * b, operation: "keer", a, b };
}

function makeG4Halveren(wl: number): Question {
  const maxVal = Math.round(4 + (wl - 1) * (16 / 19)); // 4 to 20, even numbers
  const evenMax = Math.floor(maxVal / 2) * 2;
  const val = rnd(1, evenMax / 2) * 2; // pick even number
  const b = 2;
  return { question: `${val} ÷ ${b} = ?`, answer: val / b, operation: "deel", a: val / b, b };
}

function makeG4Splitsing(wl: number): Question {
  const total = Math.round(4 + (wl - 1) * (6 / 19)); // 4 to 10
  const a = rnd(0, total);
  const b = total - a;
  return { question: `${a} + ${b} = ?`, answer: total, operation: "plus", a, b };
}

function makeG4(wl: number): Question {
  const choices = [makeG4Plus, makeG4Min, makeG4Tafel, makeG4Halveren, makeG4Splitsing];
  return pickFrom(choices)(wl);
}

// ─── Groep 5 +/- generators ───────────────────────────────────────────────────
// optellen/aftrekken t/m 100

function makeG5Plus(wl: number): Question {
  const max = Math.round(10 + (wl - 1) * (90 / 19)); // 10 to 100
  const a = rnd(1, max - 1);
  const b = rnd(1, Math.min(max - a, max));
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG5Min(wl: number): Question {
  const max = Math.round(10 + (wl - 1) * (90 / 19));
  const a = rnd(2, max);
  const b = rnd(1, a - 1);
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG5PlusMin(wl: number): Question {
  return Math.random() < 0.5 ? makeG5Plus(wl) : makeG5Min(wl);
}

// ─── Groep 5 tafels generators ────────────────────────────────────────────────
// tafels 1-10 + deeltafels 1-10

function makeG5Tafel(wl: number): Question {
  const maxB = Math.round(2 + (wl - 1) * (8 / 19)); // tafel 2 to 10
  const b = rnd(1, maxB);
  const a = rnd(1, 10);
  return { question: `${a} × ${b} = ?`, answer: a * b, operation: "keer", a, b };
}

function makeG5Deel(wl: number): Question {
  const maxB = Math.round(2 + (wl - 1) * (8 / 19));
  const b = rnd(1, maxB);
  const a = rnd(1, 10);
  return { question: `${a * b} ÷ ${b} = ?`, answer: a, operation: "deel", a, b };
}

function makeG5Tafels(wl: number): Question {
  return Math.random() < 0.5 ? makeG5Tafel(wl) : makeG5Deel(wl);
}

// ─── Groep 6 tafels generators ────────────────────────────────────────────────
// alle tafels/deeltafels + hogere tafels (×10, ×15, ×20 ... ×100)

const HOGERE_TAFELS = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];

function makeG6Tafel(wl: number): Question {
  const a = rnd(1, 10);
  const b = rnd(1, 10);
  return { question: `${a} × ${b} = ?`, answer: a * b, operation: "keer", a, b };
}

function makeG6Deel(wl: number): Question {
  const a = rnd(1, 10);
  const b = rnd(1, 10);
  return { question: `${a * b} ÷ ${b} = ?`, answer: a, operation: "deel", a, b };
}

function makeG6HogereTafel(wl: number): Question {
  const maxIdx = Math.round((wl - 1) * (HOGERE_TAFELS.length - 1) / 19);
  const factor = HOGERE_TAFELS[Math.floor(Math.random() * (maxIdx + 1))];
  const a = rnd(2, 9);
  return { question: `${a} × ${factor} = ?`, answer: a * factor, operation: "keer", a, b: factor };
}

function makeG6HogereDeel(wl: number): Question {
  const maxIdx = Math.round((wl - 1) * (HOGERE_TAFELS.length - 1) / 19);
  const factor = HOGERE_TAFELS[Math.floor(Math.random() * (maxIdx + 1))];
  const a = rnd(2, 9);
  return { question: `${a * factor} ÷ ${factor} = ?`, answer: a, operation: "deel", a, b: factor };
}

function makeG6Tafels(wl: number): Question {
  // At low wl: mostly regular tafels; at high wl: mix in hogere tafels
  const useHoger = wl >= 8 && Math.random() < (wl - 7) / 13;
  if (useHoger) {
    return Math.random() < 0.5 ? makeG6HogereTafel(wl) : makeG6HogereDeel(wl);
  }
  return Math.random() < 0.5 ? makeG6Tafel(wl) : makeG6Deel(wl);
}

// ─── Groep 6 sommen generators ────────────────────────────────────────────────
// + uitkomst t/m 50, - minsommen vanaf 50

function makeG6Plus(wl: number): Question {
  // Result between 10 and 50
  const maxResult = Math.round(15 + (wl - 1) * (35 / 19)); // 15 to 50
  const a = rnd(5, maxResult - 5);
  const b = rnd(3, maxResult - a);
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG6Min(wl: number): Question {
  // a - b where a is between 20 and 99
  const maxA = Math.round(20 + (wl - 1) * (79 / 19)); // 20 to 99
  const a = rnd(15, maxA);
  const b = rnd(3, Math.min(a - 1, 30));
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG6Sommen(wl: number): Question {
  return Math.random() < 0.5 ? makeG6Plus(wl) : makeG6Min(wl);
}

// ─── Groep 7 generators ───────────────────────────────────────────────────────
// + t/m 100, - vanaf 100, hogere tafels/deeltafels

function makeG7Plus(wl: number): Question {
  const maxResult = Math.round(30 + (wl - 1) * (70 / 19)); // 30 to 100
  const a = rnd(10, maxResult - 10);
  const b = rnd(5, maxResult - a);
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG7Min(wl: number): Question {
  // a between 20 and 200 (no negatives)
  const maxA = Math.round(20 + (wl - 1) * (180 / 19));
  const a = rnd(15, maxA);
  const b = rnd(5, Math.min(a - 1, 50));
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG7HogereTafel(wl: number): Question {
  const maxIdx = Math.min(wl, HOGERE_TAFELS.length - 1);
  const factor = HOGERE_TAFELS[rnd(0, maxIdx)];
  const a = rnd(2, 9);
  return Math.random() < 0.5
    ? { question: `${a} × ${factor} = ?`, answer: a * factor, operation: "keer", a, b: factor }
    : { question: `${a * factor} ÷ ${factor} = ?`, answer: a, operation: "deel", a, b: factor };
}

function makeG7(wl: number): Question {
  const r = Math.random();
  if (r < 0.4) return makeG7Plus(wl);
  if (r < 0.7) return makeG7Min(wl);
  return makeG7HogereTafel(wl);
}

// ─── Groep 8 generators ───────────────────────────────────────────────────────
// + /- t/m 1000, percentages met ronde getallen

const PCT_VALUES = [10, 20, 25, 50];  // nice percentages
const PCT_BASES  = [100, 200, 300, 400, 500, 150, 250, 80, 120, 60, 40];

function makeG8Plus(wl: number): Question {
  const step = wl < 10 ? 10 : 25; // round numbers
  const max = wl < 10 ? 500 : 1000;
  const a = Math.round(rnd(10, max - 10) / step) * step;
  const b = Math.round(rnd(10, max - a) / step) * step;
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG8Min(wl: number): Question {
  const step = wl < 10 ? 10 : 25;
  const maxA = wl < 10 ? 500 : 1000;
  const a = Math.round(rnd(50, maxA) / step) * step;
  const b = Math.round(rnd(10, a - 10) / step) * step;
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG8Pct(wl: number): Question {
  const pct = pickFrom(PCT_VALUES);
  const base = pickFrom(PCT_BASES);
  const answer = Math.round((pct / 100) * base);
  return {
    question: `${pct}% van ${base} = ?`,
    answer,
    operation: "pct",
    a: pct,
    b: base,
  };
}

function makeG8(wl: number): Question {
  const r = Math.random();
  if (wl <= 12) {
    // First 12 levels: sommen only
    return r < 0.5 ? makeG8Plus(wl) : makeG8Min(wl);
  }
  // Last 8 levels: mix in percentages
  if (r < 0.35) return makeG8Plus(wl);
  if (r < 0.65) return makeG8Min(wl);
  return makeG8Pct(wl);
}

// ─── Main generator ───────────────────────────────────────────────────────────

function makeForStage(stage: Stage, wl: number): Question {
  switch (stage) {
    case "g4":          return makeG4(wl);
    case "g5_plus_min": return makeG5PlusMin(wl);
    case "g5_tafels":   return makeG5Tafels(wl);
    case "g6_tafels":   return makeG6Tafels(wl);
    case "g6_sommen":   return makeG6Sommen(wl);
    case "g7":          return makeG7(wl);
    case "g8":          return makeG8(wl);
  }
}

/**
 * Generate a question for the given level.
 * If retryPool is provided and non-empty, 70% chance to pull a wrong question from it.
 */
export function generateQuestion(level: number, retryPool: Question[] = []): Question {
  if (retryPool.length > 0 && Math.random() < 0.70) {
    return retryPool[Math.floor(Math.random() * retryPool.length)];
  }
  const stage = levelToStage(level);
  const wl = withinStageLevel(level);
  return makeForStage(stage, wl);
}

export function getUnlockThreshold(): number {
  return UNLOCK_THRESHOLD;
}

/** Operations unlocked so far, based on global level */
export function unlockedOperations(level: number): Operation[] {
  const stage = levelToStage(level);
  const ops: Operation[] = ["plus"];
  if (!["g4"].includes(stage)) ops.push("min");
  if (["g5_tafels","g6_tafels","g6_sommen","g7","g8"].includes(stage)) ops.push("keer");
  if (["g5_tafels","g6_tafels","g6_sommen","g7","g8"].includes(stage)) ops.push("deel");
  if (stage === "g8") ops.push("pct");
  return ops;
}
