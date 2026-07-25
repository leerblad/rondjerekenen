import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { prevSchoolDay } from "@/lib/streak";

const RESTORE_COST = 20;

export async function POST(req: Request) {
  const { studentId } = await req.json();
  if (!studentId) return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("coins, streak, streak_lost")
    .eq("id", studentId)
    .single();

  if (!student) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  if (student.coins < RESTORE_COST) return NextResponse.json({ error: "Niet genoeg munten." }, { status: 402 });
  if (!student.streak_lost) return NextResponse.json({ error: "Geen reeks om te herstellen." }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);
  const restoredDate = prevSchoolDay(today);
  const newCoins = student.coins - RESTORE_COST;

  await supabaseAdmin
    .from("students")
    .update({ coins: newCoins, streak: student.streak_lost, streak_lost: 0, streak_updated_date: restoredDate })
    .eq("id", studentId);

  return NextResponse.json({ coins: newCoins, streak: student.streak_lost });
}
