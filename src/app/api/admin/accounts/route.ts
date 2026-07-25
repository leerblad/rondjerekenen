import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("rr_admin")?.value === "1";
}

export async function GET() {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { data: teachers } = await supabaseAdmin
    .from("teachers")
    .select("id, name, email, class_code, created_at")
    .order("created_at", { ascending: false });

  const { data: students } = await supabaseAdmin
    .from("students")
    .select("id, nickname, class_code, grade, coins, streak, streak_lost, current_operation, created_at")
    .order("created_at", { ascending: false });

  return NextResponse.json({ teachers: teachers ?? [], students: students ?? [] });
}
