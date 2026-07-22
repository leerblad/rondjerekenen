// ─── Operation types (the 4 actual arithmetic operations) ────────────────────

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
  "plus",
  "min",
  "plus_min",
  "keer",
  "deel",
  "keer_deel",
  "alles",
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

/** Time per question in ms: 20 s at within-level 1, 5 s at within-level 20 */
export function getTimeLimit(level: number): number {
  const wl = withinStageLevel(level);
  return Math.round(20000 - (wl - 1) * (15000 / 19));
}

/** Fixed session length regardless of level */
export function getSessionLength(): number {
  return 20;
}

/**
 * Required accuracy to advance: 80 % at within-level 1 → 99 % at within-level 20.
 * Returns a fraction (0–1).
 */
export function getUnlockThreshold(level: number): number {
  const wl = withinStageLevel(level);
  return (79 + wl) / 100;
}

// ─── Question generation ──────────────────────────────────────────────────────

export type Question = {
  question: string;
  answer: number;
  operation: Operation;
};

function rnd(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Max addend/subtrahend for a given within-level */
function addRange(wl: number): number {
  if (wl <= 4) return 10;
  if (wl <= 8) return 20;
  if (wl <= 12) return 50;
  if (wl <= 16) return 100;
  return 500;
}

/** Max factor for multiplication at a given within-level */
function keerRange(wl: number): { a: number; b: number } {
  if (wl <= 5) return { a: 5, b: 5 };
  if (wl <= 10) return { a: 10, b: 10 };
  if (wl <= 15) return { a: 10, b: 20 };
  return { a: 12, b: 25 };
}

function makePlus(wl: number): Question {
  const max = addRange(wl);
  const a = rnd(1, max);
  const b = rnd(1, max);
  return {
    question: `${a} + ${b} = ?`,
    answer: a + b,
    operation: "plus",
  };
}

function makeMin(wl: number): Question {
  const max = addRange(wl);
  let a = rnd(1, max);
  let b = rnd(1, max);
  if (b > a) [a, b] = [b, a];
  return {
    question: `${a} − ${b} = ?`,
    answer: a - b,
    operation: "min",
  };
}

function makeKeer(wl: number): Question {
  const { a: maxA, b: maxB } = keerRange(wl);
  const a = rnd(1, maxA);
  const b = rnd(1, maxB);
  return {
    question: `${a} × ${b} = ?`,
    answer: a * b,
    operation: "keer",
  };
}

function makeDeel(wl: number): Question {
  const { a: maxA, b: maxB } = keerRange(wl);
  const a = rnd(1, maxA);
  const b = rnd(1, maxB);
  const product = a * b;
  return {
    question: `${product} ÷ ${b} = ?`,
    answer: a,
    operation: "deel",
  };
}

function pickFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateQuestion(level: number): Question {
  const stage = levelToStage(level);
  const wl = withinStageLevel(level);

  switch (stage) {
    case "plus":
      return makePlus(wl);
    case "min":
      return makeMin(wl);
    case "plus_min":
      return pickFrom([makePlus, makeMin])(wl);
    case "keer":
      return makeKeer(wl);
    case "deel":
      return makeDeel(wl);
    case "keer_deel":
      return pickFrom([makeKeer, makeDeel])(wl);
    case "alles":
      return pickFrom([makePlus, makeMin, makeKeer, makeDeel])(wl);
  }
}

// ─── Backward-compat helpers (portal display) ────────────────────────────────

/** Operations unlocked so far, based on global level */
export function unlockedOperations(level: number): Operation[] {
  const stage = levelToStage(level);
  const reached: Operation[] = [];
  if (["plus", "min", "plus_min", "keer", "deel", "keer_deel", "alles"].includes(stage))
    reached.push("plus");
  if (["min", "plus_min", "keer", "deel", "keer_deel", "alles"].includes(stage))
    reached.push("min");
  if (["keer", "deel", "keer_deel", "alles"].includes(stage))
    reached.push("keer");
  if (["deel", "keer_deel", "alles"].includes(stage))
    reached.push("deel");
  return reached;
}
