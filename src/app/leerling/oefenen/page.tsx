"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import {
  generateQuestion,
  getTimeLimit,
  levelToStage,
  STAGE_LABELS,
  withinStageLevel,
  UNLOCK_THRESHOLD,
  QUESTIONS_PER_LEVEL,
  SESSION_SECONDS,
  BONUS_TIME_LIMIT,
  MAX_LEVEL,
  Question,
  Operation,
} from "@/lib/math";

type Phase = "start" | "playing" | "level-result" | "done";

type RecordedAnswer = {
  question: string;
  correctAnswer: number;
  studentAnswer: number | null;
  isCorrect: boolean;
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

function MasteryGrid({ answers, level }: { answers: RecordedAnswer[]; level: number }) {
  const range = Array.from({ length: 11 }, (_, i) => i);

  const stage = levelToStage(level);
  const resultMap = new Map<string, boolean>();
  for (const a of answers) {
    const key = `${a.qA}-${a.qB}`;
    if (!resultMap.has(key)) resultMap.set(key, a.isCorrect);
  }

  const isMin = stage === "min" || stage === "plus_min";

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
                // For subtraction, skip where b > a
                if (isMin && b > a) {
                  return <td key={b} className="p-0.5" />;
                }
                const key = `${a}-${b}`;
                const result = resultMap.get(key);
                const bg =
                  result === true ? "bg-green" :
                  result === false ? "bg-coral" :
                  "bg-cream";
                const text = result === true ? "text-white" : result === false ? "text-white" : "text-dark/20";
                return (
                  <td key={b} className={`p-0.5`}>
                    <div className={`flex h-5 w-5 items-center justify-center rounded ${bg} ${text}`}>
                      {result === false ? "✕" : result === true ? "✓" : "·"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-1 text-xs text-dark/30">
        <span className="inline-block h-3 w-3 rounded bg-green mr-1" />goed
        <span className="inline-block h-3 w-3 rounded bg-coral mx-1 ml-2" />fout
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

  useEffect(() => {
    if (ready && !student) router.replace("/leerling");
  }, [ready, student, router]);

  const clearQTimer = () => {
    if (qTimerRef.current) { clearInterval(qTimerRef.current); qTimerRef.current = null; }
  };
  const clearTotalTimer = () => {
    if (totalTimerRef.current) { clearInterval(totalTimerRef.current); totalTimerRef.current = null; }
  };

  // ── Finish the entire session ──────────────────────────────────────────────
  const endSession = useCallback(() => {
    clearQTimer();
    clearTotalTimer();
    setPhase("done");
  }, []);

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

    // If bonus or total time is up → go straight to done
    const secsLeft = isBonus ? 0 : Math.max(0, SESSION_SECONDS - Math.floor((Date.now() - sessionStartRef.current) / 1000));
    if (isBonus || secsLeft <= 5) {
      setPhase("done");
    } else {
      setPhase("level-result");
    }
  }, [student, isBonus, updateStudent]);

  // ── Start a single question ────────────────────────────────────────────────
  const startQuestion = useCallback((recorded: RecordedAnswer[], lvl: number, pool: Question[]) => {
    clearQTimer();
    if (submitTimerRef.current) clearTimeout(submitTimerRef.current);

    const q = generateQuestion(lvl, pool);
    questionRef.current = q;
    setQuestion(q);
    setQIndex(recorded.length);
    setFlash(null);
    setLocked(false);
    setInputValue("");
    setQTimePct(100);
    startRef.current = Date.now();
    setTimeout(() => inputRef.current?.focus(), 50);

    const timeLimit = isBonus ? BONUS_TIME_LIMIT : getTimeLimit(lvl);
    const start = Date.now();

    qTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const pct = Math.max(0, 100 - (elapsed / timeLimit) * 100);
      setQTimePct(pct);
      if (elapsed >= timeLimit) {
        clearQTimer();
        // Time's up for this question — auto-submit null
        const curr = questionRef.current;
        if (!curr) return;
        const rec: RecordedAnswer = {
          question: curr.question,
          correctAnswer: curr.answer,
          studentAnswer: null,
          isCorrect: false,
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
            finishLevel(next, currentLevelRef.current);
          } else {
            startQuestion(next, currentLevelRef.current, retryPoolRef.current);
          }
        }, 700);
      }
    }, 50);
  }, [isBonus, finishLevel]);

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
      responseTimeMs: Date.now() - startRef.current,
      qA: q.a,
      qB: q.b,
      qOp: q.operation,
    };
    answersRef.current = [...answersRef.current, rec];
    setFlash(isCorrect ? "green" : "red");

    setTimeout(() => {
      const next = answersRef.current;
      if (next.length >= QUESTIONS_PER_LEVEL) {
        finishLevel(next, currentLevelRef.current);
      } else {
        startQuestion(next, currentLevelRef.current, retryPoolRef.current);
      }
    }, isCorrect ? 300 : 800);
  }, [locked, finishLevel, startQuestion]);

  // ── Start session (10-minute timer + first question) ──────────────────────
  const startSession = useCallback(() => {
    const lvl = student?.level ?? 1;
    currentLevelRef.current = lvl;
    setCurrentLevel(lvl);
    answersRef.current = [];
    retryPoolRef.current = [];
    sessionStartRef.current = Date.now();
    setPhase("playing");

    if (!isBonus) {
      // 10-minute total countdown
      totalTimerRef.current = setInterval(() => {
        const secs = Math.max(0, SESSION_SECONDS - Math.floor((Date.now() - sessionStartRef.current) / 1000));
        setTotalSecsLeft(secs);
        if (secs <= 0) {
          clearTotalTimer();
          clearQTimer();
          finishLevel(answersRef.current, currentLevelRef.current);
        }
      }, 500);
    }

    startQuestion([], lvl, []);
  }, [student, isBonus, startQuestion, finishLevel]);

  // Auto-start for bonus (skip start screen)
  useEffect(() => {
    if (ready && student && isBonus && !startedRef.current) {
      startedRef.current = true;
      startSession();
    }
    return () => { clearQTimer(); clearTotalTimer(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, student]);

  // ── Go to next level ───────────────────────────────────────────────────────
  const goNextLevel = useCallback((result: LevelResult) => {
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
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-5xl mb-4">📚</p>
          <h1 className="text-2xl font-extrabold">Je start nu aan het rondje rekenen van 10 minuten.</h1>
          <p className="mt-3 text-sm text-dark/50">
            {STAGE_LABELS[stage]} · level {wl}/20
          </p>
          <button
            onClick={startSession}
            className="mt-8 w-full rounded-full bg-coral py-4 text-lg font-extrabold text-white transition hover:opacity-90"
          >
            Starten!
          </button>
          <Link href="/leerling/portal" className="mt-4 block text-sm text-dark/40 hover:text-coral">
            ← Terug
          </Link>
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

          {/* Mastery grid */}
          {levelResult && (
            <div className="mt-6">
              <p className="mb-2 text-sm font-semibold">Overzicht sommen:</p>
              <MasteryGrid answers={answersRef.current} level={r.level} />
            </div>
          )}

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

  // ── Done screen ────────────────────────────────────────────────────────────
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

  if (phase === "done") {
    const totalCorrect = levelsCompleted.reduce((s, r) => s + r.correct, 0);
    const totalAnswered = levelsCompleted.reduce((s, r) => s + r.total, 0);

    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
        <div className="w-full rounded-3xl bg-white p-10 shadow-sm">
          <p className="text-4xl mb-2">🎉</p>
          <h1 className="text-2xl font-extrabold">Je bent klaar voor vandaag!</h1>

          {totalAnswered > 0 && (
            <p className="mt-3 text-dark/60">
              {totalCorrect} van de {totalAnswered} sommen goed — {Math.round((totalCorrect / totalAnswered) * 100)}%
            </p>
          )}

          {totalCoinsEarned > 0 && (
            <p className="mt-3 rounded-full bg-yellow/20 px-4 py-2 font-semibold inline-block">
              +{totalCoinsEarned} munten verdiend
            </p>
          )}

          {levelsCompleted.length > 1 && (
            <div className="mt-6 text-left">
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

          <Link
            href="/leerling/portal"
            className="mt-8 block w-full rounded-full bg-coral py-3 font-bold text-white transition hover:opacity-90"
          >
            Terug naar huis
          </Link>
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
      {/* Header */}
      <div className="flex items-center justify-between text-sm text-dark/50">
        <button onClick={endSession} className="hover:text-coral">✕ Stoppen</button>
        <span className="font-mono text-xs">
          {isBonus ? "Bonus" : `${minsLeft}:${secsLeftMod.toString().padStart(2, "0")}`}
        </span>
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
      <div className="mt-2 h-3 overflow-hidden rounded-full bg-white">
        <div
          className={`h-3 rounded-full transition-none ${isBonus ? "bg-yellow" : "bg-coral"}`}
          style={{ width: `${qTimePct}%` }}
        />
      </div>

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
              submitTimerRef.current = setTimeout(() => {
                handleAnswer(parseInt(val, 10));
              }, 600);
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
