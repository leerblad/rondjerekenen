import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { UNLOCK_THRESHOLD } from "@/lib/math";

const CONSOLATION_COINS = 10;

export async function POST(req: Request) {
  const { studentId } = (await req.json()) as { studentId: string };
  if (!studentId) return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);

  // Check if any non-bonus session today has a passing score
  const { data: sessions } = await supabaseAdmin
    .from("sessions")
    .select("correct, total")
    .eq("student_id", studentId)
    .eq("date", today)
    .eq("bonus", false)
    .eq("completed", true);

  if (!sessions) return NextResponse.json({ consolation: 0 });

  const anyPassed = sessions.some(
    (s) => s.total > 0 && s.correct / s.total >= UNLOCK_THRESHOLD
  );
  if (anyPassed) return NextResponse.json({ consolation: 0 });

  // Only award consolation once per day — skip if already given today
  // (detected by checking if there are multiple non-passing sessions; we store a marker session)
  const { data: marker } = await supabaseAdmin
    .from("students")
    .select("consolation_date")
    .eq("id", studentId)
    .single();

  if (marker?.consolation_date === today) return NextResponse.json({ consolation: 0 });

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("coins")
    .eq("id", studentId)
    .single();

  const newCoins = (student?.coins ?? 0) + CONSOLATION_COINS;

  await supabaseAdmin
    .from("students")
    .update({ coins: newCoins, consolation_date: today })
    .eq("id", studentId);

  return NextResponse.json({ consolation: CONSOLATION_COINS, coins: newCoins });
}
