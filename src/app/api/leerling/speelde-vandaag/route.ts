import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const studentId = searchParams.get("studentId");
  const date = searchParams.get("date");
  if (!studentId || !date) return NextResponse.json({ played: false });

  const { count } = await supabaseAdmin
    .from("sessions")
    .select("id", { count: "exact", head: true })
    .eq("student_id", studentId)
    .eq("date", date)
    .eq("completed", true)
    .eq("bonus", false);

  return NextResponse.json({ played: (count ?? 0) > 0 });
}
