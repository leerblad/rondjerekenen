// ─── Operation types ──────────────────────────────────────────────────────────

export type Operation = "plus" | "min" | "keer" | "deel";

export const OPERATIONS: Operation[] = ["plus", "min", "keer", "deel"];

export const OPERATION_LABELS: Record<Operation, string> = {
  plus: "Plus",
  min: "Min",
  keer: "Keer",
  deel: "Deel",
};

export const OPERATION_SYMBOLS: Record<Operation, string> = {
  plus: "+",
  min: "−",
  keer: "×",
  deel: "÷",
};

// ─── Stage (7 phases, 20 levels each = 140 total) ────────────────────────────

export type Stage = "plus" | "min" | "plus_min" | "keer" | "deel" | "keer_deel" | "alles";

export const STAGES: Stage[] = [
  "plus", "min", "plus_min", "keer", "deel", "keer_deel", "alles",
];

export const STAGE_LABELS: Record<Stage, string> = {
  plus: "Plus",
  min: "Min",
  plus_min: "Plus & Min",
  keer: "Keer",
  deel: "Delen",
  keer_deel: "Keer & Delen",
  alles: "Alles",
};

export const LEVELS_PER_STAGE = 20;
export const MAX_LEVEL = STAGES.length * LEVELS_PER_STAGE; // 140
export const QUESTIONS_PER_LEVEL = 20;
export const SESSION_SECONDS = 600; // 10 minutes
export const BONUS_TIME_LIMIT = 2000; // 2s per question in bonus mode
export const UNLOCK_THRESHOLD = 0.80; // 80% to advance

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

// ─── Time & difficulty ────────────────────────────────────────────────────────

/** Time per question in ms: 6000ms at within-level 1, 3000ms at within-level 20 */
export function getTimeLimit(level: number): number {
  const wl = withinStageLevel(level);
  return Math.round(6000 - (wl - 1) * (3000 / 19));
}

/** Max operand for a given within-level — scales from 5 to 10 */
export function maxForWL(wl: number): number {
  if (wl <= 4) return 5;
  if (wl <= 8) return 7;
  if (wl <= 12) return 8;
  if (wl <= 16) return 9;
  return 10;
}

// ─── Question type ────────────────────────────────────────────────────────────

export type Question = {
  question: string;
  answer: number;
  operation: Operation;
  a: number; // first operand (for mastery grid)
  b: number; // second operand (for mastery grid)
};

// ─── Question generation ──────────────────────────────────────────────────────

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function makePlus(wl: number): Question {
  const max = maxForWL(wl);
  const a = rnd(0, max);
  const b = rnd(0, max);
  return { question: `${a} + ${b} = ?`, answer: a + b, operation: "plus", a, b };
}

function makeMin(wl: number): Question {
  const max = maxForWL(wl);
  let a = rnd(0, max);
  let b = rnd(0, max);
  if (b > a) [a, b] = [b, a];
  return { question: `${a} − ${b} = ?`, answer: a - b, operation: "min", a, b };
}

function makeKeer(wl: number): Question {
  const max = maxForWL(wl);
  const a = rnd(0, max);
  const b = rnd(0, max);
  return { question: `${a} × ${b} = ?`, answer: a * b, operation: "keer", a, b };
}

function makeDeel(wl: number): Question {
  const max = maxForWL(wl);
  const a = rnd(1, max); // quotient
  const b = rnd(1, max); // divisor
  return { question: `${a * b} ÷ ${b} = ?`, answer: a, operation: "deel", a, b };
}

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function makeForStage(stage: Stage, wl: number): Question {
  switch (stage) {
    case "plus": return makePlus(wl);
    case "min": return makeMin(wl);
    case "plus_min": return pickFrom([makePlus, makeMin])(wl);
    case "keer": return makeKeer(wl);
    case "deel": return makeDeel(wl);
    case "keer_deel": return pickFrom([makeKeer, makeDeel])(wl);
    case "alles": return pickFrom([makePlus, makeMin, makeKeer, makeDeel])(wl);
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getUnlockThreshold(): number {
  return UNLOCK_THRESHOLD;
}

/** Operations unlocked so far, based on global level */
export function unlockedOperations(level: number): Operation[] {
  const stage = levelToStage(level);
  const reached: Operation[] = [];
  if (["plus","min","plus_min","keer","deel","keer_deel","alles"].includes(stage)) reached.push("plus");
  if (["min","plus_min","keer","deel","keer_deel","alles"].includes(stage)) reached.push("min");
  if (["keer","deel","keer_deel","alles"].includes(stage)) reached.push("keer");
  if (["deel","keer_deel","alles"].includes(stage)) reached.push("deel");
  return reached;
}
