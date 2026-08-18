import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Returns fresh student data from DB — called by the student portal on load
// so teacher changes (level, streak) are picked up without re-login.
// Streak is calculated the same way as the teacher portal (dynamic from sessions).
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

  // Dynamic streak — same logic as teacher portal
  const today = new Date().toISOString().slice(0, 10);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  const { data: sessions } = await supabaseAdmin
    .from("sessions")
    .select("date")
    .eq("student_id", studentId)
    .eq("completed", true)
    .order("date", { ascending: false });

  const days = Array.from(
    new Set((sessions || []).map((x: { date: string }) => x.date))
  ).sort((a, b) => (a < b ? 1 : -1));

  let dynamicStreak = 0;
  const mostRecent = days[0] ?? "";
  if (mostRecent === today || mostRecent === yesterdayStr) {
    const cursor = new Date(mostRecent);
    for (const d of days) {
      const want = cursor.toISOString().slice(0, 10);
      if (d === want) {
        dynamicStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (d < want) {
        break;
      }
    }
  }

  const protectedUntil = data.streak_protected_until ?? "";
  const teacherRestored = protectedUntil >= yesterdayStr;
  const streak = teacherRestored ? Math.max(dynamicStreak, data.streak ?? 0) : dynamicStreak;

  return NextResponse.json({
    level: data.level ?? 1,
    coins: data.coins ?? 0,
    streak,
    streakLost: streak === 0 && (data.streak_lost ?? 0) > 0 ? data.streak_lost : 0,
    streakProtectedUntil: data.streak_protected_until ?? null,
  });
}
