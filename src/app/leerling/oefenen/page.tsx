"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import {
  generateQuestion,
  generateBonusQuestion,
  generateWarmupQuestion,
  getTimeLimit,
  levelToStage,
  levelToGrade,
  STAGE_LABELS,
  withinStageLevel,
  UNLOCK_THRESHOLD,
  QUESTIONS_PER_LEVEL,
  SESSION_SECONDS,
  BONUS_TIME_LIMIT,
  WARMUP_COUNT,
  WARMUP_TIME_MS,
  MAX_LEVEL,
  Question,
  Operation,
} from "@/lib/math";

type Phase = "start" | "warmup" | "playing" | "level-result" | "done";

type RecordedAnswer = {
  question: string;
  correctAnswer: number;
  studentAnswer: number | null;
  isCorrect: boolean;
  isTimeout: boolean;
  responseTimeMs: number;
  qA: number;
  qB: number;
  qOp: Operation;
};

type LevelResult = {
  level: number;
  correct: number;
  total: number;
  pct: number;
  passed: boolean;
  newLevel: number;
  coinsAwarded: number;
  unlockedStageLabel: string | null;
  wrongQuestions: Question[];
};

// ─── Mastery grid ─────────────────────────────────────────────────────────────

type CellResult = "correct" | "wrong" | "timeout";

function MasteryGrid({ answers, level }: { answers: RecordedAnswer[]; level: number }) {
  const range = Array.from({ length: 11 }, (_, i) => i);

  const stage = levelToStage(level);
  const resultMap = new Map<string, CellResult>();
  for (const a of answers) {
    const key = `${a.qA}-${a.qB}`;
    if (!resultMap.has(key)) {
      resultMap.set(key, a.isCorrect ? "correct" : a.isTimeout ? "timeout" : "wrong");
    }
  }

  const isMin = stage.includes("min");

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse text-center text-xs">
        <thead>
          <tr>
            <th className="p-0.5 text-dark/30" style={{ minWidth: 22 }}></th>
            {range.map((b) => (
              <th key={b} className="p-0.5 font-mono font-semibold text-dark/40" style={{ minWidth: 22 }}>
                {b}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {range.map((a) => (
            <tr key={a}>
              <td className="p-0.5 font-mono font-semibold text-dark/40">{a}</td>
              {range.map((b) => {
                if (isMin && b > a) return <td key={b} className="p-0.5" />;
                const key = `${a}-${b}`;
                const result = resultMap.get(key);
                const bg =
                  result === "correct" ? "bg-green" :
                  result === "wrong"   ? "bg-coral" :
                  result === "timeout" ? "bg-purple" :
                  "bg-cream";
                const text = result ? "text-white" : "text-dark/20";
                const symbol =
                  result === "correct" ? "✓" :
                  result === "wrong"   ? "✕" :
                  result === "timeout" ? "⏱" :
                  "·";
                return (
                  <td key={b} className="p-0.5">
                    <div className={`flex h-5 w-5 items-center justify-center rounded ${bg} ${text}`}>
                      {symbol}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-dark/30 flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-green" />goed</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-coral" />fout</span>
        <span className="flex items-center gap-1"><span className="inline-block h-3 w-3 rounded bg-purple" />te laat</span>
      </p>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

function OefelenInner() {
  const router = useRouter();
  const params = useSearchParams();
  const isBonus = params.get("bonus") === "1";
  const { user, ready, updateStudent } = useAuth();
  const student = user?.role === "student" ? user : null;

  const [phase, setPhase] = useState<Phase>("start");
  const [currentLevel, setCurrentLevel] = useState<number | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [qIndex, setQIndex] = useState(0);
  const [flash, setFlash] = useState<"green" | "red" | null>(null);
  const [locked, setLocked] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [qTimePct, setQTimePct] = useState(100);
  const [totalSecsLeft, setTotalSecsLeft] = useState(SESSION_SECONDS);
  const [levelResult, setLevelResult] = useState<LevelResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [retryPool, setRetryPool] = useState<Question[]>([]);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [levelsCompleted, setLevelsCompleted] = useState<LevelResult[]>([]);
  const [consolationCoins, setConsolationCoins] = useState(0);
  const consolationCalledRef = useRef(false);

  // Ref to break circular dependency between startQuestion ↔ finishLevel
  const finishLevelRef = useRef<(recorded: RecordedAnswer[], lvl: number) => void>(() => {});

  const sessionStartRef = useRef<number>(0);
  const questionRef = useRef<Question | null>(null);
  const startRef = useRef<number>(0);
  const answersRef = useRef<RecordedAnswer[]>([]);
  const retryPoolRef = useRef<Question[]>([]);
  const currentLevelRef = useRef<number>(1);
  const totalTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const qTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const submitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const startedRef = useRef(false);
  const finishingRef = useRef(false);
  const timeUpRef = useRef(false); // soft timer: finish current level before stopping
  const pausedMsRef = useRef<number>(0);   // total ms spent paused
  const pausedAtRef = useRef<number | null>(null); // timestamp of current pause start
  const [isPaused, setIsPaused] = useState(false);

  // ── Warm-up state ─────────────────────────────────────────────────────────
  const warmupCountRef = useRef(0);   // how many warmup questions shown so far
  const warmupCorrectRef = useRef(0); // how many answered correctly
  const [warmupIndex, setWarmupIndex] = useState(0);
  const [warmupCorrect, setWarmupCorrect] = useState(0);

  // ── Adaptive time limit for grade 8 (non-tafels) ─────────────────────────
  // Persisted in localStorage; adjusts after each level based on accuracy
  const ADAPTIVE_MIN = 3000;
  const ADAPTIVE_MAX = 6000;
  const ADAPTIVE_STEP = 200; // 0.2s per stap

  const getAdaptiveTime = useCallback((lvl: number): number => {
    const grade = levelToGrade(lvl);
    const stage = levelToStage(lvl);
    // g8_tafels always stays at 2s (speed drill)
    if (grade !== 8 || stage === "g8_tafels") return getTimeLimit(lvl);
    try {
      const stored = localStorage.getItem(`rr_atime_${student?.id}`);
      return stored ? Math.min(ADAPTIVE_MAX, Math.max(ADAPTIVE_MIN, Number(stored))) : ADAPTIVE_MAX;
    } catch { return ADAPTIVE_MAX; }
  }, [student?.id]);

  const adjustAdaptiveTime = useCallback((lvl: number, pct: number) => {
    const grade = levelToGrade(lvl);
    const stage = levelToStage(lvl);
    if (grade !== 8 || stage === "g8_tafels") return;
    try {
      const key = `rr_atime_${student?.id}`;
      const current = Math.min(ADAPTIVE_MAX, Math.max(ADAPTIVE_MIN, Number(localStorage.getItem(key) ?? ADAPTIVE_MAX)));
      let next = current;
      if (pct >= 0.85 && current > ADAPTIVE_MIN) next = current - ADAPTIVE_STEP;
      else if (pct < 0.70 && current < ADAPTIVE_MAX) next = current + ADAPTIVE_STEP;
      if (next !== current) localStorage.setItem(key, String(next));
    } catch { /* ignore */ }
  }, [student?.id]);

  // ── Timer visibility preference (stored in localStorage) ─────────────────
  const [hideTimer, setHideTimer] = useState(() => {
    try { return localStorage.getItem("rr_hide_timer") === "1"; } catch { return false; }
  });
  function toggleHideTimer() {
    setHideTimer((v) => {
      const next = !v;
      try { localStorage.setItem("rr_hide_timer", next ? "1" : "0"); } catch { /* ignore */ }
      return next;
    });
  }

  useEffect(() => {
    if (ready && !student) router.replace("/leerling");
  }, [ready, student, router]);

  const clearQTimer = () => {
    if (qTimerRef.current) { clearInterval(qTimerRef.current); qTimerRef.current = null; }
  };
  const clearTotalTimer = () => {
    if (totalTimerRef.current) { clearInterval(totalTimerRef.current); totalTimerRef.current = null; }
  };

  /** Returns elapsed session seconds, excluding paused time */
  const elapsedSecs = useCallback(() => {
    const paused = pausedMsRef.current + (pausedAtRef.current ? Date.now() - pausedAtRef.current : 0);
    return Math.floor((Date.now() - sessionStartRef.current - paused) / 1000);
  }, []);

  // ── Finish the entire session ──────────────────────────────────────────────
  const endSession = useCallback(() => {
    clearQTimer();
    clearTotalTimer();
    setPhase("done");
  }, []);

  // ── Pause / resume ────────────────────────────────────────────────────────
  const pauseSession = useCallback(() => {
    if (pausedAtRef.current) return; // already paused
    pausedAtRef.current = Date.now();
    clearQTimer();
    // Don't clear the total timer — it already skips ticks while pausedAtRef is set
    setIsPaused(true);
  }, []);

  const resumeSession = useCallback((startQ: (rec: RecordedAnswer[], lvl: number, pool: Question[]) => void) => {
    if (!pausedAtRef.current) return;
    pausedMsRef.current += Date.now() - pausedAtRef.current;
    pausedAtRef.current = null;
    setIsPaused(false);
    // Restart the per-question timer (give full time again — fair to the student)
    startQ(answersRef.current, currentLevelRef.current, retryPoolRef.current);
  }, []);

  // ── Start a single question ────────────────────────────────────────────────
  const startQuestion = useCallback((recorded: RecordedAnswer[], lvl: number, pool: Question[]) => {
    clearQTimer();
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);

    // Never show the same question twice in a row
    const prev = questionRef.current;
    let q = isBonus ? generateBonusQuestion(lvl, pool) : generateQuestion(lvl, pool);
    if (prev && q.question === prev.question) {
      q = isBonus ? generateBonusQuestion(lvl, pool) : generateQuestion(lvl, pool);
    }
    questionRef.current = q;
    setQuestion(q);
    setQIndex(recorded.length);
    setFlash(null);
    setLocked(false);
    setInputValue("");
    setQTimePct(100);
    startRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 50);

    const timeLimit = isBonus ? BONUS_TIME_LIMIT : getAdaptiveTime(lvl);
    const start = Date.now();

    qTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / timeLimit) * 100);
      setQTimePct(pct);
      if (elapsed >= timeLimit) {
        clearQTimer();
        const curr = questionRef.current;
        if (!curr) return;
        const rec: RecordedAnswer = {
          question: curr.question,
          correctAnswer: curr.answer,
          studentAnswer: null,
          isCorrect: false,
          isTimeout: true,
          responseTimeMs: timeLimit,
          qA: curr.a,
          qB: curr.b,
          qOp: curr.operation,
        };
        const next = [...answersRef.current, rec];
        answersRef.current = next;
        setFlash("red");
        setTimeout(() => {
          if (next.length >= QUESTIONS_PER_LEVEL) {
            finishLevelRef.current(next, currentLevelRef.current);
          } else {
            startQuestion(next, currentLevelRef.current, retryPoolRef.current);
          }
        }, 700);
      }
    }, 50);
  }, [isBonus]);

  // ── Finish one level attempt ───────────────────────────────────────────────
  const finishLevel = useCallback(async (recorded: RecordedAnswer[], lvl: number) => {
    if (finishingRef.current) return;
    finishingRef.current = true;
    clearQTimer();
    setIsSaving(true);

    const correct = recorded.filter((a) => a.isCorrect).length;
    const total = recorded.length;
    const pct = total > 0 ? correct / total : 0;
    const passed = pct >= UNLOCK_THRESHOLD;

    // Adapt time limit for grade 8 based on this level's performance
    adjustAdaptiveTime(lvl, pct);

    const wrong = recorded
      .filter((a) => !a.isCorrect)
      .map((a) => ({
        question: a.question,
        answer: a.correctAnswer,
        operation: a.qOp,
        a: a.qA,
        b: a.qB,
      } as Question));

    let newLevel = lvl;
    let coinsAwarded = 0;
    let unlockedStageLabel: string | null = null;

    if (!student) { setIsSaving(false); finishingRef.current = false; return; }

    try {
      const res = await fetch("/api/sessions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          level: lvl,
          bonus: isBonus,
          answers: recorded,
        }),
      });
      const data = await res.json();
      newLevel = data.level ?? lvl;
      coinsAwarded = data.coinsAwarded ?? 0;
      unlockedStageLabel = data.unlockedStageLabel ?? null;
      if (typeof data.coins === "number") {
        updateStudent({ coins: data.coins, level: newLevel });
      }
      if (coinsAwarded > 0) setTotalCoinsEarned((c) => c + coinsAwarded);
    } catch {
      // continue even if save fails
    }

    setIsSaving(false);
    finishingRef.current = false;

    const result: LevelResult = {
      level: lvl,
      correct,
      total,
      pct,
      passed,
      newLevel,
      coinsAwarded,
      unlockedStageLabel,
      wrongQuestions: wrong,
    };

    setLevelsCompleted((prev) => [...prev, result]);
    setLevelResult(result);
    retryPoolRef.current = wrong;
    setRetryPool(wrong);

    // Bonus: always done after one level
    if (isBonus) { setPhase("done"); return; }

    // Time is up → done (finish current level was already natural)
    if (timeUpRef.current) { setPhase("done"); return; }

    // Show result screen — student clicks through themselves
    // Pause the session timer so it doesn't tick while reading results
    if (!pausedAtRef.current) pausedAtRef.current = Date.now();
    setPhase("level-result");
  }, [student, isBonus, updateStudent, startQuestion]);

  // Keep the ref in sync so startQuestion can call finishLevel without circular deps
  finishLevelRef.current = finishLevel;

  // ── Handle student answer ──────────────────────────────────────────────────
  const handleAnswer = useCallback((choice: number | null) => {
    const q = questionRef.current;
    if (!q || locked) return;
    setLocked(true);
    clearQTimer();
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);

    const isCorrect = choice !== null && choice === q.answer;
    const rec: RecordedAnswer = {
      question: q.question,
      correctAnswer: q.answer,
      studentAnswer: choice,
      isCorrect,
      isTimeout: false,
      responseTimeMs: Date.now() - startRef.current,
      qA: q.a,
      qB: q.b,
      qOp: q.operation,
    };
    answersRef.current = [...answersRef.current, rec];
    setFlash(isCorrect ? "green" : "red");

    // If answered correctly, remove from retry pool so it won't keep returning
    if (isCorrect) {
      retryPoolRef.current = retryPoolRef.current.filter(
        (rq) => !(rq.a === q.a && rq.b === q.b && rq.operation === q.operation)
      );
      setRetryPool(retryPoolRef.current);
    }

    setTimeout(() => {
      const next = answersRef.current;
      if (next.length >= QUESTIONS_PER_LEVEL) {
        finishLevel(next, currentLevelRef.current);
      } else {
        startQuestion(next, currentLevelRef.current, retryPoolRef.current);
      }
    }, isCorrect ? 300 : 800);
  }, [locked, finishLevel, startQuestion]);

  // ── Warm-up: one question in the warmup phase ─────────────────────────────
  const startWarmupQuestion = useCallback(() => {
    clearQTimer();
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    const q = generateWarmupQuestion(questionRef.current);
    questionRef.current = q;
    setQuestion(q);
    setFlash(null);
    setLocked(false);
    setInputValue("");
    setQTimePct(100);
    startRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 50);

    const start = Date.now();
    qTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / WARMUP_TIME_MS) * 100);
      setQTimePct(pct);
      if (elapsed >= WARMUP_TIME_MS) {
        clearQTimer();
        warmupCountRef.current += 1;
        setWarmupIndex(warmupCountRef.current);
        setFlash("red");
        setTimeout(() => {
          if (warmupCountRef.current >= WARMUP_COUNT) {
            setPhase("start");
          } else {
            startWarmupQuestion();
          }
        }, 700);
      }
    }, 50);
  }, []);

  const handleWarmupAnswer = useCallback((choice: number | null) => {
    const q = questionRef.current;
    if (!q || locked) return;
    setLocked(true);
    clearQTimer();
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
    const isCorrect = choice !== null && choice === q.answer;
    if (isCorrect) {
      warmupCorrectRef.current += 1;
      setWarmupCorrect(warmupCorrectRef.current);
    }
    warmupCountRef.current += 1;
    setWarmupIndex(warmupCountRef.current);
    setFlash(isCorrect ? "green" : "red");
    setTimeout(() => {
      if (warmupCountRef.current >= WARMUP_COUNT) {
        setPhase("start");
      } else {
        startWarmupQuestion();
      }
    }, isCorrect ? 300 : 800);
  }, [locked, startWarmupQuestion]);

  // ── Start session (10-minute timer + first question) ──────────────────────
  const startSession = useCallback(() => {
    const lvl = student?.level ?? 1;
    currentLevelRef.current = lvl;
    setCurrentLevel(lvl);
    answersRef.current = [];
    retryPoolRef.current = [];
    timeUpRef.current = false;
    sessionStartRef.current = Date.now();
    setPhase("playing");

    if (!isBonus) {
      // 10-minute total countdown (paused time is excluded via elapsedSecs)
      totalTimerRef.current = setInterval(() => {
        if (pausedAtRef.current) return; // timer ticks but display doesn't change while paused
        const secs = Math.max(0, SESSION_SECONDS - elapsedSecs());
        setTotalSecsLeft(secs);
        if (secs <= 0 && !timeUpRef.current) {
          timeUpRef.current = true;
          clearTotalTimer();
          // Don't cut off mid-level — let the current level finish naturally
        }
      }, 500);
    }

    startQuestion([], lvl, []);
  }, [student, isBonus, startQuestion, finishLevel]);

  // ── Check and launch warm-up (grades 5-8, once per day, not bonus) ─────────
  const launchWithWarmup = useCallback(() => {
    if (isBonus || !student) { startSession(); return; }
    const grade = levelToGrade(student.level ?? 1);
    if (grade < 5) { startSession(); return; }
    const today = new Date().toISOString().slice(0, 10);
    const key = `rr_warmup_${student.id}_${today}`;
    if (typeof window !== "undefined" && localStorage.getItem(key)) {
      startSession(); return;
    }
    // Mark done for today
    try { localStorage.setItem(key, "1"); } catch { /* ignore */ }
    warmupCountRef.current = 0;
    warmupCorrectRef.current = 0;
    setWarmupIndex(0);
    setWarmupCorrect(0);
    setPhase("warmup");
    startWarmupQuestion();
  }, [isBonus, student, startSession, startWarmupQuestion]);

  // Auto-start for bonus (skip start screen)
  useEffect(() => {
    if (ready && student && isBonus && !startedRef.current) {
      startedRef.current = true;
      startSession();
    }
    return () => { clearQTimer(); clearTotalTimer(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, student]);

  // Page Visibility API: auto-pause when tab is hidden, resume when visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        // Only pause if we're actively playing
        if (phase === "playing" && !pausedAtRef.current) {
          pauseSession();
        }
      } else {
        if (pausedAtRef.current) {
          resumeSession(startQuestion);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [phase, pauseSession, resumeSession, startQuestion]);

  // Consolation coins: 10 if no level was passed this session (non-bonus only)
  useEffect(() => {
    if (phase !== "done" || isBonus || consolationCalledRef.current || !student) return;
    if (levelsCompleted.some((r) => r.passed)) return;
    consolationCalledRef.current = true;
    fetch("/api/leerling/troost-munten", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.consolation > 0) {
          setConsolationCoins(d.consolation);
          setTotalCoinsEarned((c) => c + d.consolation);
          updateStudent({ coins: d.coins });
        }
      })
      .catch(() => {});
  }, [phase, isBonus, levelsCompleted, student, updateStudent]);

  // ── Go to next level ───────────────────────────────────────────────────────
  const goNextLevel = useCallback((result: LevelResult) => {
    // Resume session timer that was paused during result screen
    if (pausedAtRef.current) {
      pausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    const nextLvl = result.newLevel > result.level ? result.newLevel : result.level;
    currentLevelRef.current = nextLvl;
    setCurrentLevel(nextLvl);
    answersRef.current = [];
    retryPoolRef.current = [];
    setRetryPool([]);
    setLevelResult(null);
    setPhase("playing");
    startQuestion([], nextLvl, []);
  }, [startQuestion]);

  // ── Retry current level ────────────────────────────────────────────────────
  const retryLevel = useCallback((result: LevelResult) => {
    // Resume session timer that was paused during result screen
    if (pausedAtRef.current) {
      pausedMsRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
    const pool = result.wrongQuestions;
    currentLevelRef.current = result.level;
    setCurrentLevel(result.level);
    answersRef.current = [];
    retryPoolRef.current = pool;
    setRetryPool(pool);
    setLevelResult(null);
    setPhase("playing");
    startQuestion([], result.level, pool);
  }, [startQuestion]);

  if (!ready || !student) return null;

  const lvl = currentLevel ?? student.level ?? 1;
  const wl = withinStageLevel(lvl);
  const stage = levelToStage(lvl);

  // ── Start screen ───────────────────────────────────────────────────────────
  if (phase === "start") {
    const warmupDone = warmupIndex >= WARMUP_COUNT;
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="rounded-3xl bg-white p-10 shadow-sm w-full">
          {warmupDone && (
            <div className="mb-6 rounded-2xl bg-green/10 px-4 py-3 text-green font-semibold text-sm">
              Opwarmen klaar! {warmupCorrect}/{WARMUP_COUNT} keersommen goed.
            </div>
          )}
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-dark/50"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          <h1 className="text-2xl font-extrabold">Je start nu aan het rondje rekenen van 10 minuten.</h1>
          <p className="mt-3 text-sm text-dark/50">
            {STAGE_LABELS[stage]} · level {wl}/20
          </p>
          <button
            onClick={launchWithWarmup}
            className="mt-8 w-full rounded-full bg-coral py-4 text-lg font-extrabold text-white transition hover:opacity-90"
          >
            Starten!
          </button>

          {/* Timer toggle */}
          <div className="mt-5 rounded-2xl bg-cream px-4 py-3 text-left text-sm">
            <p className="text-dark/60">
              Tijdens het oefenen zie je een <strong>tijdbalk</strong> die aftelt per som. Wil je die liever verbergen?
            </p>
            <button
              onClick={toggleHideTimer}
              className="mt-2 flex items-center gap-2 font-semibold text-dark/70 hover:text-dark"
            >
              <span className={`inline-flex h-5 w-9 items-center rounded-full transition ${hideTimer ? "bg-purple" : "bg-dark/20"}`}>
                <span className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${hideTimer ? "translate-x-4" : "translate-x-0.5"}`} />
              </span>
              {hideTimer ? "Tijdbalk verborgen" : "Tijdbalk zichtbaar"}
            </button>
          </div>

          <Link href="/leerling/portal" className="mt-4 block text-sm text-dark/40 hover:text-coral">
            ← Terug
          </Link>
        </div>
      </main>
    );
  }

  // ── Warm-up screen ─────────────────────────────────────────────────────────
  if (phase === "warmup") {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-dark/50">Dagelijks opwarmen</p>
            <p className="text-xs text-dark/30">{warmupIndex + 1} van {WARMUP_COUNT} keersommen · 3 seconden</p>
          </div>
          <div className="flex gap-1">
            {Array.from({ length: WARMUP_COUNT }).map((_, i) => (
              <div key={i} className={`h-2 w-6 rounded-full ${i < warmupIndex ? "bg-green" : i === warmupIndex ? "bg-coral" : "bg-cream"}`} />
            ))}
          </div>
        </div>

        {/* Timer bar */}
        <div className="mb-4 h-2 overflow-hidden rounded-full bg-cream">
          <div className="h-2 rounded-full bg-coral transition-none" style={{ width: `${qTimePct}%` }} />
        </div>

        {/* Flash overlay */}
        {flash && (
          <div className={`pointer-events-none fixed inset-0 z-10 opacity-20 ${flash === "green" ? "bg-green" : "bg-coral"}`} />
        )}

        {/* Question */}
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <p className="text-5xl font-extrabold tracking-tight">{question?.question}</p>
          <form onSubmit={(e) => { e.preventDefault(); const v = parseInt(inputValue, 10); if (!isNaN(v)) handleWarmupAnswer(v); }} className="flex w-full flex-col items-center gap-4">
            <input
              ref={inputRef}
              type="number"
              inputMode="numeric"
              value={inputValue}
              onChange={(e) => {
                const val = e.target.value;
                setInputValue(val);
                if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
                if (val.trim() !== "") {
                  const v = parseInt(val, 10);
                  const isCorrect = !isNaN(v) && questionRef.current && v === questionRef.current.answer;
                  submitTimerRef.current = setTimeout(() => {
                    if (!isNaN(v)) handleWarmupAnswer(v);
                  }, isCorrect ? 300 : 600);
                }
              }}
              disabled={locked}
              autoFocus
              className="w-full rounded-2xl border-2 border-black/10 bg-white px-6 py-5 text-center text-4xl font-extrabold focus:border-coral focus:outline-none disabled:opacity-50"
            />
          </form>
        </div>
      </main>
    );
  }

  // ── Level result screen ────────────────────────────────────────────────────
  if (phase === "level-result" && levelResult) {
    const r = levelResult;
    const pctStr = Math.round(r.pct * 100);
    const secsLeft = Math.max(0, SESSION_SECONDS - Math.floor((Date.now() - sessionStartRef.current) / 1000));
    const minsLeft = Math.floor(secsLeft / 60);
    const secsLeftMod = secsLeft % 60;

    return (
      <main className="mx-auto max-w-md px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-center text-5xl font-extrabold" style={{ color: r.passed ? "#3AB54A" : "#E8705A" }}>
            {pctStr}%
          </p>
          <p className="mt-1 text-center text-lg font-semibold">
            {r.correct} van de {r.total} goed
          </p>

          {r.unlockedStageLabel && (
            <div className="mt-4 rounded-2xl bg-green/10 px-4 py-3 text-center font-semibold text-green">
              Nieuw onderdeel: {r.unlockedStageLabel}!
            </div>
          )}
          {!r.unlockedStageLabel && r.newLevel > r.level && (
            <div className="mt-4 rounded-2xl bg-green/10 px-4 py-3 text-center font-semibold text-green">
              Level {r.newLevel} bereikt!
            </div>
          )}
          {!r.passed && (
            <p className="mt-3 text-center text-sm text-dark/50">
              Je hebt {Math.round(UNLOCK_THRESHOLD * 100)}% nodig om door te gaan. Probeer het nog een keer!
            </p>
          )}

          {/* Wrong sums */}
          {r.wrongQuestions.length > 0 && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Lastige sommen:</p>
              <div className="flex flex-wrap gap-2">
                {r.wrongQuestions.map((q, i) => (
                  <span key={i} className="rounded-xl bg-coral/10 px-3 py-1 font-mono text-sm font-semibold text-coral">
                    {q.question.replace(" = ?", "")} = {q.answer}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mastery grid — only for multiplication/division stages */}
          {levelResult && (() => {
            const s = levelToStage(r.level);
            const isTafels = ["g4_tafels","g5_tafels","g5_deeltafels","g5_tafels_alles",
              "g6_tafels","g6_deeltafels","g6_hogere","g7_tafels","g7_deeltafels","g8_tafels"].includes(s);
            return isTafels ? (
              <div className="mt-6">
                <p className="mb-2 text-sm font-semibold">Overzicht sommen:</p>
                <MasteryGrid answers={answersRef.current} level={r.level} />
              </div>
            ) : null;
          })()}

          {/* Remaining time */}
          <p className="mt-4 text-center text-xs text-dark/40">
            Nog {minsLeft}:{secsLeftMod.toString().padStart(2, "0")} over van je 10 minuten
          </p>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col gap-3">
            {isSaving ? (
              <p className="text-center text-sm text-dark/40">Opslaan...</p>
            ) : (
              <>
                {r.passed && r.newLevel < MAX_LEVEL && (
                  <button
                    onClick={() => goNextLevel(r)}
                    className="w-full rounded-full bg-green py-3 font-bold text-white transition hover:opacity-90"
                  >
                    Volgende level →
                  </button>
                )}
                <button
                  onClick={() => retryLevel(r)}
                  className="w-full rounded-full bg-purple py-3 font-bold text-white transition hover:opacity-90"
                >
                  {r.passed ? "Nog een keer" : "Opnieuw proberen"}
                </button>
                <button
                  onClick={endSession}
                  className="w-full rounded-full bg-cream py-3 font-semibold text-dark/60 transition hover:bg-black/5"
                >
                  Stop voor vandaag
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    );
  }

  if (phase === "done") {
    const totalCorrect = levelsCompleted.reduce((s, r) => s + r.correct, 0);
    const totalAnswered = levelsCompleted.reduce((s, r) => s + r.total, 0);
    const levelsPassed = levelsCompleted.filter((r) => r.passed).length;
    const BONUS_COST = 20;
    const canBonus = (student?.coins ?? 0) >= BONUS_COST;

    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-full rounded-3xl bg-white p-10 shadow-sm">
          <div className="flex justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-dark/70"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <h1 className="text-2xl font-extrabold">
            {isBonus ? "Bonus sessie klaar!" : "Je bent klaar voor vandaag!"}
          </h1>

          {totalAnswered > 0 && (
            <p className="mt-3 text-dark/60">
              {totalCorrect} van de {totalAnswered} sommen goed, {Math.round((totalCorrect / totalAnswered) * 100)}%
            </p>
          )}

          {totalCoinsEarned > 0 && (
            <p className="mt-3 rounded-full bg-yellow/20 px-4 py-2 font-semibold inline-block">
              +{totalCoinsEarned} munten verdiend
            </p>
          )}

          {levelsCompleted.length > 0 && (
            <div className="mt-4 text-left">
              <p className="mb-2 text-sm font-semibold text-dark/60">Per level:</p>
              {levelsCompleted.map((r, i) => (
                <div key={i} className="flex justify-between border-t border-black/5 py-2 text-sm">
                  <span>{STAGE_LABELS[levelToStage(r.level)]} level {withinStageLevel(r.level)}</span>
                  <span className="font-mono font-semibold" style={{ color: r.passed ? "#3AB54A" : "#E8705A" }}>
                    {Math.round(r.pct * 100)}%
                  </span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/leerling/portal"
              className="block w-full rounded-full bg-coral py-3 font-bold text-white transition hover:opacity-90"
            >
              Terug naar huis
            </Link>
            <Link
              href="/leerling/winkel"
              className="block w-full rounded-full bg-yellow/30 py-3 font-semibold text-dark transition hover:opacity-80"
            >
              Naar de winkel
            </Link>
            {!isBonus && (
              <Link
                href={canBonus ? "/leerling/oefenen?bonus=1" : "#"}
                className={`block w-full rounded-full py-3 font-semibold transition ${canBonus ? "bg-purple text-white hover:opacity-90" : "bg-cream text-dark/30 cursor-not-allowed"}`}
                onClick={canBonus ? undefined : (e) => e.preventDefault()}
              >
                Extra sessie {canBonus ? `(${BONUS_COST} munten)` : `(${BONUS_COST - (student?.coins ?? 0)} munten te kort)`}
              </Link>
            )}
          </div>
        </div>
      </main>
    );
  }

  // ── Playing screen ─────────────────────────────────────────────────────────
  const totalPct = isBonus ? 100 : (totalSecsLeft / SESSION_SECONDS) * 100;
  const minsLeft = Math.floor(totalSecsLeft / 60);
  const secsLeftMod = totalSecsLeft % 60;

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
      {/* Paused overlay */}
      {isPaused && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-dark/80 text-center text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
          <h2 className="text-2xl font-extrabold">Gepauzeerd</h2>
          <p className="text-sm text-white/60">De timer staat stil.</p>
          <button
            onClick={() => resumeSession(startQuestion)}
            className="rounded-full bg-coral px-8 py-4 text-lg font-extrabold text-white transition hover:opacity-90"
          >
            ▶ Verder spelen
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between text-sm text-dark/50">
        <button onClick={endSession} className="hover:text-coral">✕ Stoppen</button>
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs">
            {isBonus ? "Bonus" : `${minsLeft}:${secsLeftMod.toString().padStart(2, "0")}`}
          </span>
          {!isBonus && (
            <button
              onClick={() => isPaused ? resumeSession(startQuestion) : pauseSession()}
              className="rounded-full bg-cream px-2 py-0.5 text-xs font-semibold text-dark/60 hover:bg-black/10"
            >
              {isPaused ? "▶" : "⏸"}
            </button>
          )}
        </div>
        <span className="font-mono text-xs">{qIndex + 1}/{QUESTIONS_PER_LEVEL}</span>
      </div>

      <div className="mt-1 text-center text-xs text-dark/40">
        {STAGE_LABELS[stage]} · level {wl}/20
      </div>

      {/* Total time bar */}
      {!isBonus && (
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
          <div
            className="h-1.5 rounded-full bg-purple/40 transition-all"
            style={{ width: `${totalPct}%` }}
          />
        </div>
      )}

      {/* Question progress */}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
        <div
          className="h-2 rounded-full bg-purple transition-all"
          style={{ width: `${(qIndex / QUESTIONS_PER_LEVEL) * 100}%` }}
        />
      </div>

      {/* Per-question timer */}
      {!hideTimer && (
        <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
          <div
            className={`h-3 rounded-full transition-none ${isBonus ? "bg-yellow" : "bg-coral"}`}
            style={{ width: `${qTimePct}%` }}
          />
        </div>
      )}

      {/* Question */}
      <div className={`mt-10 flex flex-1 flex-col items-center justify-center rounded-3xl transition ${
        flash === "green" ? "bg-green/10" : flash === "red" ? "bg-coral/10" : ""
      }`}>
        <p className="whitespace-nowrap font-mono text-4xl font-bold sm:text-5xl">
          {question?.question}
        </p>
        {flash === "red" && question && (
          <p className="mt-4 text-lg font-semibold text-coral">
            Antwoord: {question.answer}
          </p>
        )}
      </div>

      {/* Input */}
      <form
        className="mb-4 flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (locked || inputValue.trim() === "") return;
          if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
          handleAnswer(parseInt(inputValue, 10));
        }}
      >
        <input
          ref={inputRef}
          type="number"
          inputMode="numeric"
          autoFocus
          disabled={locked}
          value={inputValue}
          onChange={(e) => {
            const val = e.target.value;
            setInputValue(val);
            if (submitTimerRef.current) clearTimeout(submitTimerRef.current);
            if (val.trim() !== "") {
              const parsed = parseInt(val, 10);
              const isCorrect = !isNaN(parsed) && questionRef.current && parsed === questionRef.current.answer;
              submitTimerRef.current = setTimeout(() => {
                handleAnswer(parsed);
              }, isCorrect ? 300 : 1500);
            }
          }}
          placeholder="?"
          className="w-full rounded-2xl border-4 border-transparent bg-white py-6 text-center font-mono text-5xl font-bold shadow-sm outline-none transition focus:border-coral disabled:opacity-60 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        />
      </form>
    </main>
  );
}

export default function OefelenPage() {
  return <Suspense><OefelenInner /></Suspense>;
}
