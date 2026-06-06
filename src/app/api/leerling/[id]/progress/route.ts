import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: sessions } = await supabaseAdmin
    .from("sessions")
    .select("id, date, operation, total, correct, completed, created_at")
    .eq("student_id", id)
    .order("date", { ascending: false })
    .limit(60);

  const list = sessions || [];

  // % correct per operation
  const perOp: Record<string, { total: number; correct: number }> = {};
  for (const s of list) {
    const cur = perOp[s.operation] || { total: 0, correct: 0 };
    cur.total += s.total;
    cur.correct += s.correct;
    perOp[s.operation] = cur;
  }

  const operationStats = Object.entries(perOp).map(([operation, v]) => ({
    operation,
    total: v.total,
    correct: v.correct,
    pct: v.total ? Math.round((v.correct / v.total) * 100) : 0,
  }));

  // ─── Hardest questions ────────────────────────────────────────────────────
  const sessionIds = list.map((s) => s.id);
  let hardestQuestions: {
    question: string;
    total: number;
    wrong: number;
    pct_wrong: number;
  }[] = [];

  if (sessionIds.length) {
    const { data: answers } = await supabaseAdmin
      .from("answers")
      .select("question, is_correct")
      .in("session_id", sessionIds);

    const perQ: Record<string, { total: number; wrong: number }> = {};
    for (const a of answers || []) {
      const cur = perQ[a.question] || { total: 0, wrong: 0 };
      cur.total += 1;
      if (!a.is_correct) cur.wrong += 1;
      perQ[a.question] = cur;
    }

    hardestQuestions = Object.entries(perQ)
      .filter(([, v]) => v.total >= 3)
      .map(([question, v]) => ({
        question,
        total: v.total,
        wrong: v.wrong,
        pct_wrong: Math.round((v.wrong / v.total) * 100),
      }))
      .sort((a, b) => b.pct_wrong - a.pct_wrong)
      .slice(0, 8);
  }

  // ─── Daily scores (last 14 days) ──────────────────────────────────────────
  const perDay: Record<string, { total: number; correct: number }> = {};
  for (const s of list) {
    const cur = perDay[s.date] || { total: 0, correct: 0 };
    cur.total += s.total;
    cur.correct += s.correct;
    perDay[s.date] = cur;
  }

  const days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }

  const dailyScores = days.map((date) => {
    const v = perDay[date];
    return {
      date,
      pct: v && v.total ? Math.round((v.correct / v.total) * 100) : 0,
    };
  });

  return NextResponse.json({
    sessions: list,
    operationStats,
    hardestQuestions,
    dailyScores,
  });
}
