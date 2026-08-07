import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Teacher restores a student's streak (e.g. after illness or holiday).
// Sets streak_protected_until = today + 2 days so the dynamic calc respects it.
export async function POST(req: Request) {
  const { studentId } = await req.json();
  if (!studentId) return NextResponse.json({ error: "missing studentId" }, { status: 400 });

  // Calculate historical streak from session data (no today/yesterday constraint)
  const { data: sessions } = await supabaseAdmin
    .from("sessions")
    .select("date")
    .eq("student_id", studentId)
    .eq("completed", true)
    .order("date", { ascending: false });

  const days = Array.from(new Set((sessions || []).map((x: { date: string }) => x.date)))
    .sort((a, b) => (a < b ? 1 : -1));

  let historicalStreak = 0;
  if (days.length > 0) {
    const cursor = new Date(days[0] as string);
    for (const d of days) {
      const want = cursor.toISOString().slice(0, 10);
      if (d === want) {
        historicalStreak++;
        cursor.setDate(cursor.getDate() - 1);
      } else if (d < want) {
        break;
      }
    }
  }

  // Protected until 2 days from now so the streak survives the next school day
  const protectedUntil = new Date();
  protectedUntil.setDate(protectedUntil.getDate() + 2);
  const protectedUntilStr = protectedUntil.toISOString().slice(0, 10);

  const { error } = await supabaseAdmin
    .from("students")
    .update({
      streak: historicalStreak,
      streak_lost: 0,
      streak_protected_until: protectedUntilStr,
    })
    .eq("id", studentId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ streak: historicalStreak, protectedUntil: protectedUntilStr });
}
