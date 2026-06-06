"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import {
  generateQuestion,
  getSessionLength,
  getTimeLimit,
  Operation,
  OPERATION_LABELS,
  Question,
} from "@/lib/math";

type RecordedAnswer = {
  question: string;
  correctAnswer: number;
  studentAnswer: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
};

type Flash = "green" | "red" | null;

export default function Oefenen() {
  const router = useRouter();
  const { user, ready, updateStudent } = useAuth();
  const student = user && user.role === "student" ? user : null;

  const [question, setQuestion] = useState<Question | null>(null);
  const [index, setIndex] = useState(0);
  const [flash, setFlash] = useState<Flash>(null);
  const [locked, setLocked] = useState(false);
  const [timeLeft, setTimeLeft] = useState(100);
  const [done, setDone] = useState(false);
  const [summary, setSummary] = useState<{
    correct: number;
    total: number;
    coinsAwarded: number;
    unlockedOperation: string | null;
  } | null>(null);

  const answersRef = useRef<RecordedAnswer[]>([]);
  const startRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionRef = useRef<Question | null>(null);

  const operation = (student?.currentOperation || "plus") as Operation;
  const grade = student?.grade || 4;
  const total = getSessionLength(grade);
  const timeLimit = getTimeLimit(grade);

  useEffect(() => {
    if (ready && !student) router.replace("/leerling");
  }, [ready, student, router]);

  const clearTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  };

  const finishSession = useCallback(
    async (recorded: RecordedAnswer[]) => {
      clearTimer();
      setDone(true);
      if (!student) return;
      const res = await fetch("/api/sessions/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          operation,
          answers: recorded,
        }),
      });
      const data = await res.json();
      setSummary({
        correct: data.correct ?? recorded.filter((a) => a.isCorrect).length,
        total: data.total ?? recorded.length,
        coinsAwarded: data.coinsAwarded ?? 0,
        unlockedOperation: data.unlockedOperation ?? null,
      });
      if (typeof data.coins === "number") {
        updateStudent({
          coins: data.coins,
          currentOperation: data.currentOperation ?? student.currentOperation,
        });
      }
    },
    [student, operation, updateStudent]
  );

  const nextQuestion = useCallback(
    (recorded: RecordedAnswer[]) => {
      if (recorded.length >= total) {
        finishSession(recorded);
        return;
      }
      const q = generateQuestion(operation, grade);
      questionRef.current = q;
      setQuestion(q);
      setIndex(recorded.length);
      setLocked(false);
      setFlash(null);
      setTimeLeft(100);
      startRef.current = Date.now();

      clearTimer();
      const start = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - start;
        const pct = Math.max(0, 100 - (elapsed / timeLimit) * 100);
        setTimeLeft(pct);
        if (elapsed >= timeLimit) {
          handleAnswer(null);
        }
      }, 50);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [operation, grade, total, timeLimit, finishSession]
  );

  const handleAnswer = useCallback(
    (choice: number | null) => {
      const q = questionRef.current;
      if (!q || locked) return;
      setLocked(true);
      clearTimer();

      const isCorrect = choice === q.answer;
      const responseTimeMs = Date.now() - startRef.current;
      const rec: RecordedAnswer = {
        question: q.question,
        correctAnswer: q.answer,
        studentAnswer: choice,
        isCorrect,
        responseTimeMs,
      };
      answersRef.current = [...answersRef.current, rec];
      setFlash(isCorrect ? "green" : "red");

      setTimeout(
        () => nextQuestion(answersRef.current),
        isCorrect ? 350 : 900
      );
    },
    [locked, nextQuestion]
  );

  // start the session once
  const startedRef = useRef(false);
  useEffect(() => {
    if (ready && student && !startedRef.current) {
      startedRef.current = true;
      nextQuestion([]);
    }
    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, student]);

  if (!ready || !student) return null;

  if (done) {
    const s = summary;
    const pct = s && s.total ? Math.round((s.correct / s.total) * 100) : 0;
    const message =
      pct >= 80 ? "Geweldig gedaan! 🌟" : pct >= 50 ? "Goed bezig! 💪" : "Blijf oefenen! 🚀";
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
        <h1 className="text-3xl font-extrabold">Klaar!</h1>
        {!s ? (
          <p className="text-dark/40">Opslaan...</p>
        ) : (
          <>
            <p className="font-mono text-6xl font-bold text-green">{pct}%</p>
            <p className="text-lg">
              {s.correct} van de {s.total} goed
            </p>
            <p className="text-2xl">{message}</p>
            {s.coinsAwarded > 0 && (
              <p className="rounded-full bg-yellow/20 px-4 py-2 font-semibold">
                +{s.coinsAwarded} munten 🪙
              </p>
            )}
            {s.unlockedOperation && (
              <p className="rounded-2xl bg-green/15 px-4 py-3 font-semibold text-green">
                🎉 Nieuw onderdeel vrijgespeeld:{" "}
                {OPERATION_LABELS[s.unlockedOperation as Operation]}!
              </p>
            )}
            <Link
              href="/leerling/portal"
              className="mt-2 rounded-full bg-coral px-8 py-3 font-semibold text-white"
            >
              Terug naar huis
            </Link>
          </>
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-6 py-8">
      <div className="flex items-center justify-between text-sm text-dark/50">
        <Link href="/leerling/portal">✕ Stoppen</Link>
        <span className="font-mono">
          {index + 1} / {total}
        </span>
      </div>

      {/* progress */}
      <div className="mt-3 h-2 rounded-full bg-white">
        <div
          className="h-2 rounded-full bg-purple transition-all"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      {/* countdown */}
      <div className="mt-3 h-3 overflow-hidden rounded-full bg-white">
        <div
          className="h-3 rounded-full bg-coral"
          style={{
            width: `${timeLeft}%`,
            transition: "width 50ms linear",
          }}
        />
      </div>

      <div
        className={`mt-10 flex flex-1 flex-col items-center justify-center rounded-3xl ${
          flash === "green" ? "flash-green" : flash === "red" ? "flash-red" : ""
        }`}
      >
        <p className="font-mono text-6xl font-bold sm:text-7xl">
          {question?.question}
        </p>
        {flash === "red" && question && (
          <p className="mt-4 text-lg text-coral">
            Juiste antwoord: {question.answer}
          </p>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {question?.options.map((opt) => (
          <button
            key={opt}
            disabled={locked}
            onClick={() => handleAnswer(opt)}
            className="rounded-2xl bg-white py-6 font-mono text-3xl font-bold shadow-sm transition hover:bg-purple hover:text-white disabled:opacity-60"
          >
            {opt}
          </button>
        ))}
      </div>
    </main>
  );
}
