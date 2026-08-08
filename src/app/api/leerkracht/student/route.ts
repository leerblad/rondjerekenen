import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";
import { levelToGrade, MAX_LEVEL } from "@/lib/math";

// Update a student's grade, level, and/or password (teacher action)
export async function PATCH(req: Request) {
  const { studentId, grade, level, newPassword } = await req.json();
  if (!studentId) return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });

  const update: Record<string, unknown> = {};
  if (grade !== undefined) {
    const g = Number(grade);
    if (!(g >= 4 && g <= 8)) return NextResponse.json({ error: "Ongeldige groep." }, { status: 400 });
    update.grade = g;
  }
  if (level !== undefined) {
    const l = Number(level);
    if (!(l >= 1 && l <= MAX_LEVEL)) return NextResponse.json({ error: "Ongeldig level." }, { status: 400 });
    update.level = l;
    // Keep grade column in sync with the level
    update.grade = levelToGrade(l);
  }
  if (newPassword !== undefined) {
    if (typeof newPassword !== "string" || newPassword.length < 4) {
      return NextResponse.json({ error: "Wachtwoord moet minimaal 4 tekens zijn." }, { status: 400 });
    }
    update.password_hash = await bcrypt.hash(newPassword, 10);
  }

  if (Object.keys(update).length === 0) return NextResponse.json({ ok: true });

  const { error } = await supabaseAdmin.from("students").update(update).eq("id", studentId);
  if (error) return NextResponse.json({ error: "Bijwerken mislukt." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
