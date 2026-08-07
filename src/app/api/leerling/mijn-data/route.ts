import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Returns fresh student data from DB — called by the student portal on load
// so teacher changes (level, streak) are picked up without re-login.
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  if (!studentId) return NextResponse.json({ error: "missing studentId" }, { status: 400 });

  const { data, error } = await supabaseAdmin
    .from("students")
    .select("id, level, coins, streak, streak_lost, streak_protected_until")
    .eq("id", studentId)
    .single();

  if (error || !data) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({
    level: data.level ?? 1,
    coins: data.coins ?? 0,
    streak: data.streak ?? 0,
    streakLost: data.streak_lost ?? 0,
    streakProtectedUntil: data.streak_protected_until ?? null,
  });
}
