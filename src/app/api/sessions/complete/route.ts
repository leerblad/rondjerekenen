import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { checkUnlock } from "@/lib/progress";
import { MAX_LEVEL, STAGE_LABELS, levelToStage } from "@/lib/math";
import { computeStreak } from "@/lib/streak";

type IncomingAnswer = {
  question: string;
  correctAnswer: number;
  studentAnswer: number | null;
  isCorrect: boolean;
  responseTimeMs: number;
};

const DAILY_COINS = 10;
const BONUS_COINS = 20;

export async function POST(req: Request) {
  const { studentId, level, bonus, answers } = (await req.json()) as {
    studentId: string;
    level: number;
    bonus?: boolean;
    answers: IncomingAnswer[];
  };

  if (!studentId || !level || !Array.isArray(answers)) {
    return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });
  }

  const total = answers.length;
  const correct = answers.filter((a) => a.isCorrect).length;
  const today = new Date().toISOString().slice(0, 10);
  const operation = levelToStage(level);

  // create session
  const { data: session, error: sErr } = await supabaseAdmin
    .from("sessions")
    .insert({
      student_id: studentId,
      date: today,
      operation,
      level,
      bonus: bonus ?? false,
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

  // award coins once per day
  const { count } = await supabaseAdmin
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("date", today)
    .eq("completed", true);

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("coins, level, streak, streak_updated_date, streak_lost")
    .eq("id", studentId)
    .single();

  let coinsAwarded = 0;
  let newCoins = student?.coins ?? 0;
  if (bonus) {
    coinsAwarded = BONUS_COINS;
    newCoins += BONUS_COINS;
  } else if ((count ?? 0) <= 1) {
    coinsAwarded = DAILY_COINS;
    newCoins += DAILY_COINS;
  }

  // check for level-up
  let newLevel = student?.level ?? level;
  let unlockedStageLabel: string | null = null;

  if (newLevel === level && newLevel < MAX_LEVEL) {
    const shouldUnlock = await checkUnlock(studentId, level);
    if (shouldUnlock) {
      newLevel = level + 1;
      const newStage = levelToStage(newLevel);
      const oldStage = levelToStage(level);
      if (newStage !== oldStage) {
        unlockedStageLabel = STAGE_LABELS[newStage];
      }
    }
  }

  const streakUpdate = computeStreak(today, {
    streak: student?.streak ?? 0,
    streak_updated_date: student?.streak_updated_date ?? null,
    streak_lost: student?.streak_lost ?? 0,
  });

  await supabaseAdmin
    .from("students")
    .update({ coins: newCoins, level: newLevel, ...streakUpdate })
    .eq("id", studentId);

  return NextResponse.json({
    sessionId: session.id,
    total,
    correct,
    coinsAwarded,
    coins: newCoins,
    level: newLevel,
    unlockedStageLabel,
    streak: streakUpdate.streak,
  });
}
