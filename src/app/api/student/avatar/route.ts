// PATCH /api/student/avatar — save avatar URL for a student
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: Request) {
  const { studentId, avatarUrl } = await req.json();
  if (!studentId || !avatarUrl) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { error } = await supabaseAdmin
    .from("students")
    .update({ avatar_url: avatarUrl })
    .eq("id", studentId);

  if (error) return NextResponse.json({ error: "Update failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
