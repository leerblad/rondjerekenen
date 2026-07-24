import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BONUS_COST = 20;

export async function POST(req: Request) {
  const { studentId } = await req.json();
  if (!studentId) return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("coins")
    .eq("id", studentId)
    .single();

  if (!student) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  if (student.coins < BONUS_COST) return NextResponse.json({ error: "Niet genoeg munten." }, { status: 402 });

  const newCoins = student.coins - BONUS_COST;
  await supabaseAdmin.from("students").update({ coins: newCoins }).eq("id", studentId);

  return NextResponse.json({ coins: newCoins });
}
