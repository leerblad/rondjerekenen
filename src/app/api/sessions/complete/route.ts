import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkUnlock, nextOperation } from "@/lib/progress";

type IncomingAnswer = {
  question: string;
  correctAnswer: number;
  studentAnswer: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
};

const DAILY_COINS = 10;

export async function POST(req: Request) {
  const { studentId, operation, answers } = (await req.json()) as {
    studentId: string;
    operation: string;
    answers: IncomingAnswer[];
  };

  if (!studentId || !operation || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });
  }

  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const today = new Date().toISOString().slice(0, 10);

  // create session
  const { data: session, error: sErr } = await supabaseAdmin
    .from("sessions")
    .insert({
      student_id: studentId,
      date: today,
      operation,
      total,
      correct,
      completed: true,
    })
    .select("id")
    .single();

  if (sErr || !session) {
    return NextResponse.json({ error: "Opslaan mislukt." }, { status: 500 });
  }

  if (answers.length) {
    await supabaseAdmin.from("answers").insert(
      answers.map((a) => ({
        session_id: session.id,
        question: a.question,
        correct_answer: a.correctAnswer,
        student_answer: a.studentAnswer,
        is_correct: a.isCorrect,
        response_time_ms: a.responseTimeMs,
      }))
    );
  }

  // award coins only once per day (first completed session of the day)
  const { count } = await supabaseAdmin
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("date", today)
    .eq("completed", true);

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("coins, current_operation")
    .eq("id", studentId)
    .single();

  let coinsAwarded = 0;
  let newCoins = student?.coins ?? 0;
  if ((count ?? 0) <= 1) {
    coinsAwarded = DAILY_COINS;
    newCoins += DAILY_COINS;
  }

  // check for operation unlock
  let unlocked: string | null = null;
  let newOperation = student?.current_operation ?? operation;
  if (newOperation === operation) {
    const shouldUnlock = await checkUnlock(studentId, operation);
    if (shouldUnlock) {
      const next = nextOperation(operation);
      if (next) {
        newOperation = next;
        unlocked = next;
      }
    }
  }

  await supabaseAdmin
    .from("students")
    .update({ coins: newCoins, current_operation: newOperation })
    .eq("id", studentId);

  return NextResponse.json({
    sessionId: session.id,
    total,
    correct,
    coinsAwarded,
    coins: newCoins,
    unlockedOperation: unlocked,
    currentOperation: newOperation,
  });
}
