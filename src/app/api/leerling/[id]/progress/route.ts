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

  return NextResponse.json({ sessions: list, operationStats });
}
