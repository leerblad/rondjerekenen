import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// Update a student's grade (teacher action)
export async function PATCH(req: Request) {
  const { studentId, grade } = await req.json();
  const g = Number(grade);
  if (!studentId || !(g >= 4 && g <= 8)) {
    return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });
  }
  const { error } = await supabaseAdmin
    .from("students")
    .update({ grade: g })
    .eq("id", studentId);
  if (error) {
    return NextResponse.json({ error: "Bijwerken mislukt." }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
