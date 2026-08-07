// ─── Operation types ──────────────────────────────────────────────────────────

export type Operation = "plus" | "min" | "keer" | "deel" | "pct";

export const OPERATION_LABELS: Record<Operation, string> = {
  plus: "Plus", min: "Min", keer: "Keer", deel: "Deel", pct: "Procent",
};
export const OPERATION_SYMBOLS: Record<Operation, string> = {
  plus: "+", min: "−", keer: "×", deel: "÷", pct: "%",
};

// ─── Stages: 30 blocks × 20 levels = 600 total ───────────────────────────────

export type Stage =
  // Groep 4 (levels 1-120)
  | "g4_plus" | "g4_min" | "g4_plus_min" | "g4_tafels" | "g4_halveren" | "g4_alles"
  // Groep 5 (levels 121-240)
  | "g5_plus" | "g5_min" | "g5_plus_min" | "g5_tafels" | "g5_deeltafels" | "g5_tafels_alles"
  // Groep 6 (levels 241-360)
  | "g6_tafels" | "g6_deeltafels" | "g6_hogere" | "g6_plus" | "g6_min" | "g6_alles"
  // Groep 7 (levels 361-480)
  | "g7_tafels" | "g7_deeltafels" | "g7_plus" | "g7_min" | "g7_plus_min" | "g7_alles"
  // Groep 8 (levels 481-600)
  | "g8_plus" | "g8_min" | "g8_pct_basis" | "g8_pct_meer" | "g8_plus_min" | "g8_alles";

export const STAGES: Stage[] = [
  // Groep 4
  "g4_plus", "g4_min", "g4_plus_min", "g4_tafels", "g4_halveren", "g4_alles",
  // Groep 5
  "g5_plus", "g5_min", "g5_plus_min", "g5_tafels", "g5_deeltafels", "g5_tafels_alles",
  // Groep 6
  "g6_tafels", "g6_deeltafels", "g6_hogere", "g6_plus", "g6_min", "g6_alles",
  // Groep 7
  "g7_tafels", "g7_deeltafels", "g7_plus", "g7_min", "g7_plus_min", "g7_alles",
  // Groep 8
  "g8_plus", "g8_min", "g8_pct_basis", "g8_pct_meer", "g8_plus_min", "g8_alles",
];

export const STAGE_LABELS: Record<Stage, string> = {
  g4_plus: "Plus", g4_min: "Min", g4_plus_min: "Plus & Min",
  g4_tafels: "Tafels 2, 5, 10", g4_halveren: "Halveren & Splitsingen", g4_alles: "Alles",
  g5_plus: "Plus", g5_min: "Min", g5_plus_min: "Plus & Min",
  g5_tafels: "Tafels", g5_deeltafels: "Deeltafels", g5_tafels_alles: "Tafels & Deeltafels",
  g6_tafels: "Tafels snel", g6_deeltafels: "Deeltafels snel", g6_hogere: "Hogere tafels",
  g6_plus: "Plus t/m 50", g6_min: "Min vanaf 50", g6_alles: "Alles",
  g7_tafels: "Hogere tafels snel", g7_deeltafels: "Hogere deeltafels snel",
  g7_plus: "Plus t/m 100", g7_min: "Min vanaf 100", g7_plus_min: "Plus & Min", g7_alles: "Alles",
  g8_plus: "Plus t/m 1000", g8_min: "Min vanaf 1000",
  g8_pct_basis: "Procenten (10%, 25%)", g8_pct_meer: "Meer procenten",
  g8_plus_min: "Grote sommen", g8_alles: "Alles",
};

// ─── Grade grouping ───────────────────────────────────────────────────────────

export type Grade = 4 | 5 | 6 | 7 | 8;

export const GRADE_STAGES: Record<Grade, Stage[]> = {
  4: ["g4_plus", "g4_min", "g4_plus_min", "g4_tafels", "g4_halveren", "g4_alles"],
  5: ["g5_plus", "g5_min", "g5_plus_min", "g5_tafels", "g5_deeltafels", "g5_tafels_alles"],
  6: ["g6_tafels", "g6_deeltafels", "g6_hogere", "g6_plus", "g6_min", "g6_alles"],
  7: ["g7_tafels", "g7_deeltafels", "g7_plus", "g7_min", "g7_plus_min", "g7_alles"],
  8: ["g8_plus", "g8_min", "g8_pct_basis", "g8_pct_meer", "g8_plus_min", "g8_alles"],
};

export const GRADE_START_LEVEL: Record<Grade, number> = {
  4: 1, 5: 121, 6: 241, 7: 361, 8: 481,
};

export function levelToGrade(level: number): Grade {
  if (level <= 120) return 4;
  if (level <= 240) return 5;
  if (level <= 360) return 6;
  if (level <= 480) return 7;
  return 8;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const LEVELS_PER_STAGE = 20;
export const STAGES_PER_GRADE = 6;
export const LEVELS_PER_GRADE = STAGES_PER_GRADE * LEVELS_PER_STAGE; // 120
export const MAX_LEVEL = STAGES.length * LEVELS_PER_STAGE; // 600
export const QUESTIONS_PER_LEVEL = 20;
export const SESSION_SECONDS = 600;
export const BONUS_TIME_LIMIT = 2000;
export const UNLOCK_THRESHOLD = 0.95;

/** Global level (1-600) → which stage */
export function levelToStage(level: number): Stage {
  const idx = Math.min(
    Math.floor((Math.max(1, level) - 1) / LEVELS_PER_STAGE),
    STAGES.length - 1
  );
  return STAGES[idx];
}

/** Global level → position within the current stage (1-20) */
export function withinStageLevel(level: number): number {
  return ((Math.max(1, level) - 1) % LEVELS_PER_STAGE) + 1;
}

/** Global level → position within the current grade (1-120) */
export function withinGradeLevel(level: number): number {
  const grade = levelToGrade(level);
  return level - GRADE_START_LEVEL[grade] + 1;
}

// ─── Time limits ──────────────────────────────────────────────────────────────

export function getTimeLimit(level: number): number {
  const stage = levelToStage(level);
  const wl = withinStageLevel(level);
  // Groep 6 tafels & groep 7 tafels: 3s → 2s (need to be fast)
  if (stage === "g6_tafels" || stage === "g6_deeltafels" ||
      stage === "g7_tafels" || stage === "g7_deeltafels") {
    return Math.round(3000 - (wl - 1) * (1000 / 19));
  }
  // All others: 6s → 3s
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

// ─── Utility ──────────────────────────────────────────────────────────────────

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function biasedRnd(max: number, wl: number): number {
  const power = 3 - (wl - 1) * (2 / 19);
  return Math.min(max, Math.floor(Math.pow(Math.random(), power) * (max + 1)));
}

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Scale a value from startVal at wl=1 to endVal at wl=20 */
function scale(wl: number, startVal: number, endVal: number): number {
  return Math.round(startVal + (wl - 1) * (endVal - startVal) / 19);
}

// ─── Groep 4 ──────────────────────────────────────────────────────────────────

function makeG4Plus(wl: number): Question {
  const max = scale(wl, 4, 20);
  const a = biasedRnd(max, wl);
  const b = biasedRnd(Math.min(max - a, max), wl);
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG4Min(wl: number): Question {
  const max = scale(wl, 4, 20);
  const a = rnd(1, max);
  const b = biasedRnd(a, wl);
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG4Tafel(wl: number): Question {
  const tafels = wl <= 8 ? [2, 5] : wl <= 14 ? [2, 5, 10] : [2, 5, 10];
  const b = pickFrom(tafels);
  const a = rnd(1, scale(wl, 2, 10));
  return { question: `${a} × ${b} = ?`, answer: a * b, operation: "keer", a, b };
}

function makeG4Halveren(wl: number): Question {
  if (Math.random() < 0.5) {
    // halveren
    const maxHalf = scale(wl, 2, 10);
    const half = rnd(1, maxHalf);
    const val = half * 2;
    return { question: `${val} ÷ 2 = ?`, answer: half, operation: "deel", a: half, b: 2 };
  }
  // splitsing tot 10
  const total = scale(wl, 3, 10);
  const a = rnd(0, total);
  const b = total - a;
  return { question: `${a} + ${b} = ?`, answer: total, operation: "plus", a, b };
}

// ─── Groep 5 ──────────────────────────────────────────────────────────────────

function makeG5Plus(wl: number): Question {
  const max = scale(wl, 10, 100);
  const a = rnd(1, max - 1);
  const b = rnd(1, Math.min(max - a, max));
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG5Min(wl: number): Question {
  const max = scale(wl, 10, 100);
  const a = rnd(2, max);
  const b = rnd(1, a - 1);
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG5Tafel(wl: number): Question {
  const maxTafel = scale(wl, 2, 10);
  const b = rnd(1, maxTafel);
  const a = rnd(1, 10);
  return { question: `${a} × ${b} = ?`, answer: a * b, operation: "keer", a, b };
}

function makeG5Deel(wl: number): Question {
  const maxTafel = scale(wl, 2, 10);
  const b = rnd(1, maxTafel);
  const a = rnd(1, 10);
  return { question: `${a * b} ÷ ${b} = ?`, answer: a, operation: "deel", a, b };
}

// ─── Groep 6 ──────────────────────────────────────────────────────────────────

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

function makeG6Hogere(wl: number): Question {
  const maxIdx = scale(wl, 2, HOGERE_TAFELS.length - 1);
  const factor = HOGERE_TAFELS[rnd(0, maxIdx)];
  const a = rnd(2, 9);
  if (Math.random() < 0.5) {
    return { question: `${a} × ${factor} = ?`, answer: a * factor, operation: "keer", a, b: factor };
  }
  return { question: `${a * factor} ÷ ${factor} = ?`, answer: a, operation: "deel", a, b: factor };
}

function makeG6Plus(wl: number): Question {
  const maxResult = scale(wl, 12, 50);
  const a = rnd(5, maxResult - 5);
  const b = rnd(3, Math.max(3, maxResult - a));
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG6Min(wl: number): Question {
  const maxA = scale(wl, 20, 99);
  const a = rnd(15, maxA);
  const b = rnd(3, Math.min(a - 1, scale(wl, 10, 40)));
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

// ─── Groep 7 ──────────────────────────────────────────────────────────────────

function makeG7TafelHoog(wl: number): Question {
  const maxIdx = scale(wl, 3, HOGERE_TAFELS.length - 1);
  const factor = HOGERE_TAFELS[rnd(0, maxIdx)];
  const a = rnd(2, 9);
  return { question: `${a} × ${factor} = ?`, answer: a * factor, operation: "keer", a, b: factor };
}

function makeG7DeelHoog(wl: number): Question {
  const maxIdx = scale(wl, 3, HOGERE_TAFELS.length - 1);
  const factor = HOGERE_TAFELS[rnd(0, maxIdx)];
  const a = rnd(2, 9);
  return { question: `${a * factor} ÷ ${factor} = ?`, answer: a, operation: "deel", a, b: factor };
}

function makeG7Plus(wl: number): Question {
  const maxResult = scale(wl, 30, 100);
  const a = rnd(10, maxResult - 10);
  const b = rnd(5, Math.max(5, maxResult - a));
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG7Min(wl: number): Question {
  const maxA = scale(wl, 30, 200);
  const a = rnd(20, maxA);
  const b = rnd(5, Math.min(a - 1, scale(wl, 20, 60)));
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

// ─── Groep 8 ──────────────────────────────────────────────────────────────────

const PCT_BASIS  = [10, 25, 50];
const PCT_MEER   = [10, 15, 20, 25, 50, 75];
const PCT_BASES  = [100, 200, 300, 400, 500, 80, 120, 150, 250, 60, 40, 1000];
const PCT_BASES2 = [100, 200, 150, 80, 60, 120, 250, 400, 500, 1000];

function makeG8Plus(wl: number): Question {
  const step = wl < 10 ? 10 : 25;
  const maxVal = scale(wl, 100, 1000);
  const a = Math.round(rnd(10, maxVal - 10) / step) * step;
  const b = Math.round(rnd(10, Math.max(10, maxVal - a)) / step) * step;
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG8Min(wl: number): Question {
  const step = wl < 10 ? 10 : 25;
  const maxA = scale(wl, 200, 1000);
  const a = Math.round(rnd(100, maxA) / step) * step;
  const b = Math.round(rnd(10, Math.max(10, a - 10)) / step) * step;
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG8PctBasis(wl: number): Question {
  const pct = pickFrom(PCT_BASIS);
  const base = pickFrom(PCT_BASES);
  const answer = Math.round((pct / 100) * base);
  return { question: `${pct}% van ${base} = ?`, answer, operation: "pct", a: pct, b: base };
}

function makeG8PctMeer(wl: number): Question {
  const pct = pickFrom(PCT_MEER);
  const base = pickFrom(PCT_BASES2);
  const answer = Math.round((pct / 100) * base);
  return { question: `${pct}% van ${base} = ?`, answer, operation: "pct", a: pct, b: base };
}

// ─── Stage dispatcher ─────────────────────────────────────────────────────────

function makeForStage(stage: Stage, wl: number): Question {
  switch (stage) {
    // Groep 4
    case "g4_plus":      return makeG4Plus(wl);
    case "g4_min":       return makeG4Min(wl);
    case "g4_plus_min":  return Math.random() < 0.5 ? makeG4Plus(wl) : makeG4Min(wl);
    case "g4_tafels":    return makeG4Tafel(wl);
    case "g4_halveren":  return makeG4Halveren(wl);
    case "g4_alles":     return pickFrom([makeG4Plus, makeG4Min, makeG4Tafel, makeG4Halveren])(wl);
    // Groep 5
    case "g5_plus":         return makeG5Plus(wl);
    case "g5_min":          return makeG5Min(wl);
    case "g5_plus_min":     return Math.random() < 0.5 ? makeG5Plus(wl) : makeG5Min(wl);
    case "g5_tafels":       return makeG5Tafel(wl);
    case "g5_deeltafels":   return makeG5Deel(wl);
    case "g5_tafels_alles": return Math.random() < 0.5 ? makeG5Tafel(wl) : makeG5Deel(wl);
    // Groep 6
    case "g6_tafels":    return makeG6Tafel(wl);
    case "g6_deeltafels":return makeG6Deel(wl);
    case "g6_hogere":    return makeG6Hogere(wl);
    case "g6_plus":      return makeG6Plus(wl);
    case "g6_min":       return makeG6Min(wl);
    case "g6_alles":     return pickFrom([makeG6Tafel, makeG6Deel, makeG6Hogere, makeG6Plus, makeG6Min])(wl);
    // Groep 7
    case "g7_tafels":    return makeG7TafelHoog(wl);
    case "g7_deeltafels":return makeG7DeelHoog(wl);
    case "g7_plus":      return makeG7Plus(wl);
    case "g7_min":       return makeG7Min(wl);
    case "g7_plus_min":  return Math.random() < 0.5 ? makeG7Plus(wl) : makeG7Min(wl);
    case "g7_alles":     return pickFrom([makeG7TafelHoog, makeG7DeelHoog, makeG7Plus, makeG7Min])(wl);
    // Groep 8
    case "g8_plus":      return makeG8Plus(wl);
    case "g8_min":       return makeG8Min(wl);
    case "g8_pct_basis": return makeG8PctBasis(wl);
    case "g8_pct_meer":  return makeG8PctMeer(wl);
    case "g8_plus_min":  return Math.random() < 0.5 ? makeG8Plus(wl) : makeG8Min(wl);
    case "g8_alles":     return pickFrom([makeG8Plus, makeG8Min, makeG8PctBasis, makeG8PctMeer])(wl);
  }
}

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

export function unlockedOperations(level: number): Operation[] {
  const stage = levelToStage(level);
  const ops: Operation[] = ["plus"];
  if (!["g4_plus", "g4_tafels", "g4_halveren"].includes(stage)) ops.push("min");
  if (["g4_tafels","g4_alles","g5_tafels","g5_deeltafels","g5_tafels_alles",
       "g6_tafels","g6_deeltafels","g6_hogere","g6_alles",
       "g7_tafels","g7_deeltafels","g7_alles",
       "g8_alles"].includes(stage)) ops.push("keer");
  if (["g5_deeltafels","g5_tafels_alles","g6_deeltafels","g6_hogere","g6_alles",
       "g7_deeltafels","g7_alles","g8_alles"].includes(stage)) ops.push("deel");
  if (["g8_pct_basis","g8_pct_meer","g8_alles"].includes(stage)) ops.push("pct");
  return ops;
}
