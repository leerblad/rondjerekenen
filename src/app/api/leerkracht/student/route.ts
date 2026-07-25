import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Update a student's grade and/or level (teacher action)
export async function PATCH(req: Request) {
  const { studentId, grade, level } = await req.json();
  if (!studentId) return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });

  const update: Record<string, number> = {};
  if (grade !== undefined) {
    const g = Number(grade);
    if (!(g >= 4 && g <= 8)) return NextResponse.json({ error: "Ongeldige groep." }, { status: 400 });
    update.grade = g;
  }
  if (level !== undefined) {
    const l = Number(level);
    if (!(l >= 1 && l <= 140)) return NextResponse.json({ error: "Ongeldig level." }, { status: 400 });
    update.level = l;
  }

  const { error } = await supabaseAdmin.from("students").update(update).eq("id", studentId);
  if (error) return NextResponse.json({ error: "Bijwerken mislukt." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
