import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import { prevSchoolDay } from "@/lib/streak";

async function checkAdminCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("rr_admin")?.value === "1";
}

export async function POST(req: Request) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { studentId } = await req.json();
  if (!studentId) return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("streak, streak_lost")
    .eq("id", studentId)
    .single();

  if (!student) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });
  if (!student.streak_lost) return NextResponse.json({ error: "Geen reeks om te herstellen." }, { status: 400 });

  const today = new Date().toISOString().slice(0, 10);
  const restoredDate = prevSchoolDay(today);

  await supabaseAdmin
    .from("students")
    .update({ streak: student.streak_lost, streak_lost: 0, streak_updated_date: restoredDate })
    .eq("id", studentId);

  return NextResponse.json({ streak: student.streak_lost });
}
