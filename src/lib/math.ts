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
  // Groep 4 (levels 1-120, 6 blocks)
  | "g4_plus" | "g4_min" | "g4_plus_min" | "g4_tafels" | "g4_halveren" | "g4_alles"
  // Groep 5 (levels 121-260, 7 blocks)
  | "g5_plus" | "g5_min" | "g5_plus_min" | "g5_tafels" | "g5_deeltafels" | "g5_tafels_alles" | "g5_alles"
  // Groep 6 (levels 261-380, 6 blocks)
  | "g6_tafels" | "g6_deeltafels" | "g6_hogere" | "g6_plus" | "g6_min" | "g6_alles"
  // Groep 7 (levels 381-500, 6 blocks)
  | "g7_tafels" | "g7_deeltafels" | "g7_plus" | "g7_min" | "g7_plus_min" | "g7_alles"
  // Groep 8 (levels 501-620, 6 blocks)
  | "g8_plus" | "g8_min" | "g8_pct_basis" | "g8_tafels" | "g8_plus_min" | "g8_alles";

export const STAGES: Stage[] = [
  // Groep 4 (6 blocks, levels 1-120)
  "g4_plus", "g4_min", "g4_plus_min", "g4_tafels", "g4_halveren", "g4_alles",
  // Groep 5 (7 blocks, levels 121-260)
  "g5_plus", "g5_min", "g5_plus_min", "g5_tafels", "g5_deeltafels", "g5_tafels_alles", "g5_alles",
  // Groep 6 (6 blocks, levels 261-380)
  "g6_tafels", "g6_deeltafels", "g6_hogere", "g6_plus", "g6_min", "g6_alles",
  // Groep 7 (6 blocks, levels 381-500)
  "g7_tafels", "g7_deeltafels", "g7_plus", "g7_min", "g7_plus_min", "g7_alles",
  // Groep 8 (6 blocks, levels 501-620)
  "g8_plus", "g8_min", "g8_pct_basis", "g8_tafels", "g8_plus_min", "g8_alles",
];

export const STAGE_LABELS: Record<Stage, string> = {
  // Groep 4
  g4_plus: "Optellen t/m 20",
  g4_min:       "Aftrekken t/m 20",
  g4_plus_min:  "Optellen & aftrekken t/m 20",
  g4_tafels:    "Tafels 2, 5 en 10",
  g4_halveren:  "Halveren & splitsingen",
  g4_alles:     "Alles groep 4",
  // Groep 5
  g5_plus:         "Optellen t/m 100",
  g5_min:          "Aftrekken t/m 100",
  g5_plus_min:     "Optellen & aftrekken t/m 100",
  g5_tafels:       "Alle tafels (1-10)",
  g5_deeltafels:   "Alle deeltafels (1-10)",
  g5_tafels_alles: "Tafels & deeltafels",
  g5_alles:        "Alles groep 5",
  // Groep 6
  g6_tafels:    "Tafels snel",
  g6_deeltafels:"Deeltafels snel",
  g6_hogere:    "Hogere tafels (×10, ×25...)",
  g6_plus:      "Optellen t/m 100",
  g6_min:       "Aftrekken t/m 100",
  g6_alles:     "Alles groep 6",
  // Groep 7
  g7_tafels:    "Hogere tafels snel",
  g7_deeltafels:"Hogere deeltafels snel",
  g7_plus:      "Optellen t/m 1000",
  g7_min:       "Aftrekken t/m 1000",
  g7_plus_min:  "Optellen & aftrekken t/m 1000",
  g7_alles:     "Alles groep 7",
  // Groep 8
  g8_plus:      "Optellen t/m 10.000",
  g8_min:       "Aftrekken t/m 10.000",
  g8_pct_basis: "Procenten (10%, 25%, 50%)",
  g8_tafels:    "Tafels snel (2 sec)",
  g8_plus_min:  "Grote sommen",
  g8_alles:     "Alles groep 8",
};

// ─── Grade grouping ───────────────────────────────────────────────────────────

export type Grade = 4 | 5 | 6 | 7 | 8;

export const GRADE_STAGES: Record<Grade, Stage[]> = {
  4: ["g4_plus", "g4_min", "g4_plus_min", "g4_tafels", "g4_halveren", "g4_alles"],
  5: ["g5_plus", "g5_min", "g5_plus_min", "g5_tafels", "g5_deeltafels", "g5_tafels_alles", "g5_alles"],
  6: ["g6_tafels", "g6_deeltafels", "g6_hogere", "g6_plus", "g6_min", "g6_alles"],
  7: ["g7_tafels", "g7_deeltafels", "g7_plus", "g7_min", "g7_plus_min", "g7_alles"],
  8: ["g8_plus", "g8_min", "g8_pct_basis", "g8_tafels", "g8_plus_min", "g8_alles"],
};

// Grade 5 has 7 blocks (140 levels); all others have 6 blocks (120 levels)
export const GRADE_START_LEVEL: Record<Grade, number> = {
  4: 1, 5: 121, 6: 261, 7: 381, 8: 501,
};

export function levelToGrade(level: number): Grade {
  if (level <= 120) return 4;
  if (level <= 260) return 5;
  if (level <= 380) return 6;
  if (level <= 500) return 7;
  return 8;
}

/** How many levels are in the given grade */
export function levelsInGrade(grade: Grade): number {
  return GRADE_STAGES[grade].length * LEVELS_PER_STAGE;
}

// ─── Constants ────────────────────────────────────────────────────────────────

export const LEVELS_PER_STAGE = 20;
export const STAGES_PER_GRADE = 6;
export const LEVELS_PER_GRADE = STAGES_PER_GRADE * LEVELS_PER_STAGE; // 120
export const MAX_LEVEL = STAGES.length * LEVELS_PER_STAGE; // 600
export const QUESTIONS_PER_LEVEL = 20;
export const SESSION_SECONDS = 600;
export const BONUS_TIME_LIMIT = 4000;
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
  // Groep 8 tafels: flat 2s (they should know these cold)
  if (stage === "g8_tafels") return 2000;
  // Groep 6 tafels & groep 7 tafels/deeltafels: 3s → 2s
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
  if (max < min) return min;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Scale a value from startVal at wl=1 to endVal at wl=20 */
function scale(wl: number, startVal: number, endVal: number): number {
  return Math.round(startVal + (wl - 1) * (endVal - startVal) / 19);
}

// ─── Groep 4 ─────────────────────────────────────────────────────────────────
// Optellen/aftrekken t/m 20, tafels 2/5/10, halveren en splitsingen

function makeG4Plus(wl: number): Question {
  // wl=1: max=5 (2+3=5), wl=20: max=20 (12+8=20)
  const max = scale(wl, 5, 20);
  const a = rnd(1, max - 1);
  const b = rnd(1, max - a);
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG4Min(wl: number): Question {
  // wl=1: a up to 5, wl=20: a up to 20; result always ≥ 1
  const max = scale(wl, 5, 20);
  const a = rnd(2, max);
  const b = rnd(1, a - 1);
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG4Tafel(wl: number): Question {
  // wl 1-6: only ×2; wl 7-12: ×2 and ×5; wl 13-20: ×2, ×5 and ×10
  const tafels = wl <= 6 ? [2] : wl <= 12 ? [2, 5] : [2, 5, 10];
  const b = pickFrom(tafels);
  const maxA = scale(wl, 3, 10);
  const a = rnd(1, maxA);
  return { question: `${a} × ${b} = ?`, answer: a * b, operation: "keer", a, b };
}

function makeG4Halveren(wl: number): Question {
  if (Math.random() < 0.6) {
    // halveren: "Halveer 12" → 6  (only even numbers, range grows with wl)
    const maxHalf = scale(wl, 3, 10); // half value 3-10 → full value 6-20
    const half = rnd(2, maxHalf);
    const val = half * 2; // always even, minimum 4
    return { question: `Halveer ${val}`, answer: half, operation: "deel", a: val, b: 2 };
  }
  // splitsing: "5 + ? = 8" — what goes with 5 to make the total?
  const total = scale(wl, 5, 20);
  const a = rnd(1, total - 1);
  const b = total - a;
  return { question: `${a} + ? = ${total}`, answer: b, operation: "plus", a, b };
}

// ─── Groep 5 ─────────────────────────────────────────────────────────────────
// Optellen/aftrekken t/m 100, alle tafels 1-10 en deeltafels

function makeG5Plus(wl: number): Question {
  // wl=1: result up to 20, wl=20: result up to 100
  const maxResult = scale(wl, 20, 100);
  const a = rnd(1, maxResult - 1);
  const b = rnd(1, maxResult - a);
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG5Min(wl: number): Question {
  // wl=1: a up to 20, wl=20: a up to 100; result ≥ 1
  const maxA = scale(wl, 20, 100);
  const a = rnd(2, maxA);
  const b = rnd(1, a - 1);
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeG5Tafel(wl: number): Question {
  // Progressive: start with tafels 2-4, grow to 2-10
  const maxB = scale(wl, 4, 10);
  const b = rnd(2, maxB);
  const a = rnd(1, 10);
  return { question: `${a} × ${b} = ?`, answer: a * b, operation: "keer", a, b };
}

function makeG5Deel(wl: number): Question {
  // Same progression as multiplication
  const maxB = scale(wl, 4, 10);
  const b = rnd(2, maxB);
  const a = rnd(1, 10);
  return { question: `${a * b} ÷ ${b} = ?`, answer: a, operation: "deel", a, b };
}

// ─── Groep 6 ─────────────────────────────────────────────────────────────────
// Tafels automatiseren (snel), hogere tafels, optellen/aftrekken t/m 100

const HOGERE_TAFELS = [10, 15, 20, 25, 30, 40, 50, 60, 70, 80, 90, 100];

function makeG6Tafel(wl: number): Question {
  // All tables 1-10 × 1-10, practised at speed
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
  // Multiples of 10, 15, 20 ... 100; grow the range as wl increases
  const maxIdx = scale(wl, 2, HOGERE_TAFELS.length - 1);
  const factor = HOGERE_TAFELS[rnd(0, maxIdx)];
  const a = rnd(2, 9);
  if (Math.random() < 0.5) {
    return { question: `${a} × ${factor} = ?`, answer: a * factor, operation: "keer", a, b: factor };
  }
  return { question: `${a * factor} ÷ ${factor} = ?`, answer: a, operation: "deel", a, b: factor };
}

function makeG6Plus(wl: number): Question {
  // wl=1: result up to 30, wl=20: result up to 100 (harder than grade 5 due to speed)
  const maxResult = scale(wl, 30, 100);
  const a = rnd(5, maxResult - 5);
  const b = rnd(3, maxResult - a);
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG6Min(wl: number): Question {
  // wl=1: a up to 30, wl=20: a up to 100
  const maxA = scale(wl, 30, 100);
  const a = rnd(10, maxA);
  const b = rnd(3, a - 3);
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

// ─── Groep 7 ─────────────────────────────────────────────────────────────────
// Hogere tafels snel (3s→2s), optellen/aftrekken t/m 1000

function makeG7TafelHoog(wl: number): Question {
  // Higher multiples at speed (time limit 3s→2s)
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
  // wl=1: result up to 200, wl=20: result up to 1000
  const maxResult = scale(wl, 200, 1000);
  // Use round numbers more at lower wl
  const step = wl <= 7 ? 100 : wl <= 14 ? 10 : 1;
  const a = Math.round(rnd(10, maxResult - 10) / step) * step;
  const b = Math.round(rnd(5, Math.max(5, maxResult - a)) / step) * step;
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG7Min(wl: number): Question {
  // wl=1: a up to 300, wl=20: a up to 1000
  const maxA = scale(wl, 300, 1000);
  const step = wl <= 7 ? 100 : wl <= 14 ? 10 : 1;
  const a = Math.round(rnd(100, maxA) / step) * step;
  const b = Math.round(rnd(10, Math.max(10, a - 10)) / step) * step;
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

// ─── Groep 8 ─────────────────────────────────────────────────────────────────
// Optellen/aftrekken t/m 10.000, procenten

const PCT_BASIS  = [10, 25, 50];
const PCT_MEER   = [10, 15, 20, 25, 50, 75];
const PCT_BASES  = [100, 200, 300, 400, 500, 80, 120, 150, 250, 60, 40, 1000];
const PCT_BASES2 = [100, 200, 150, 80, 60, 120, 250, 400, 500, 1000];

function makeG8Plus(wl: number): Question {
  // wl=1: result up to 2000, wl=20: result up to 10000
  const maxResult = scale(wl, 2000, 10000);
  const step = wl <= 7 ? 1000 : wl <= 14 ? 100 : 25;
  const a = Math.round(rnd(100, maxResult - 100) / step) * step;
  const b = Math.round(rnd(50, Math.max(50, maxResult - a)) / step) * step;
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeG8Min(wl: number): Question {
  // wl=1: a up to 2000, wl=20: a up to 10000
  const maxA = scale(wl, 2000, 10000);
  const step = wl <= 7 ? 1000 : wl <= 14 ? 100 : 25;
  const a = Math.round(rnd(500, maxA) / step) * step;
  const b = Math.round(rnd(50, Math.max(50, a - 50)) / step) * step;
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

function makeG8Tafel(_wl: number): Question {
  // All tables 1-10 × 1-10 at speed (flat 2s time limit for grade 8)
  const a = rnd(1, 10);
  const b = rnd(1, 10);
  if (Math.random() < 0.5) {
    return { question: `${a} × ${b} = ?`, answer: a * b, operation: "keer", a, b };
  }
  return { question: `${a * b} ÷ ${b} = ?`, answer: a, operation: "deel", a, b };
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
    case "g5_alles":        return pickFrom([makeG5Plus, makeG5Min, makeG5Tafel, makeG5Deel])(wl);
    // Groep 6
    case "g6_tafels":     return makeG6Tafel(wl);
    case "g6_deeltafels": return makeG6Deel(wl);
    case "g6_hogere":     return makeG6Hogere(wl);
    case "g6_plus":       return makeG6Plus(wl);
    case "g6_min":        return makeG6Min(wl);
    case "g6_alles":      return pickFrom([makeG6Tafel, makeG6Deel, makeG6Hogere, makeG6Plus, makeG6Min])(wl);
    // Groep 7
    case "g7_tafels":     return makeG7TafelHoog(wl);
    case "g7_deeltafels": return makeG7DeelHoog(wl);
    case "g7_plus":       return makeG7Plus(wl);
    case "g7_min":        return makeG7Min(wl);
    case "g7_plus_min":   return Math.random() < 0.5 ? makeG7Plus(wl) : makeG7Min(wl);
    case "g7_alles":      return pickFrom([makeG7TafelHoog, makeG7DeelHoog, makeG7Plus, makeG7Min])(wl);
    // Groep 8
    case "g8_plus":       return makeG8Plus(wl);
    case "g8_min":        return makeG8Min(wl);
    case "g8_pct_basis":  return makeG8PctBasis(wl);
    case "g8_tafels":     return makeG8Tafel(wl);
    case "g8_plus_min":   return Math.random() < 0.5 ? makeG8Plus(wl) : makeG8Min(wl);
    case "g8_alles":      return pickFrom([makeG8Plus, makeG8Min, makeG8PctBasis, makeG8Tafel])(wl);
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

/**
 * For bonus sessions: draw from ALL stages the student has reached,
 * weighted heavily toward recent stages (last ~3 blocks) so it stays relevant.
 * Earlier stages use wl=20 (hardest) since the student has already mastered them.
 */
export function generateBonusQuestion(currentLevel: number, retryPool: Question[] = []): Question {
  if (retryPool.length > 0 && Math.random() < 0.70) {
    return retryPool[Math.floor(Math.random() * retryPool.length)];
  }

  const currentStageIdx = Math.min(
    Math.floor((Math.max(1, currentLevel) - 1) / LEVELS_PER_STAGE),
    STAGES.length - 1
  );

  // Weight: current stage = 5, previous 2 stages = 3, previous 3-6 = 2, older = 1
  const weights: number[] = [];
  for (let i = 0; i <= currentStageIdx; i++) {
    const dist = currentStageIdx - i;
    weights.push(dist === 0 ? 5 : dist <= 2 ? 3 : dist <= 5 ? 2 : 1);
  }

  const totalWeight = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * totalWeight;
  let pickedIdx = currentStageIdx; // fallback
  for (let i = 0; i <= currentStageIdx; i++) {
    r -= weights[i];
    if (r <= 0) { pickedIdx = i; break; }
  }

  const stage = STAGES[pickedIdx];
  // Use wl=20 for older stages (they should be fast), current stage uses its natural wl
  const wl = pickedIdx === currentStageIdx ? withinStageLevel(currentLevel) : 20;
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
  if (["g8_pct_basis","g8_alles"].includes(stage)) ops.push("pct");
  return ops;
}
