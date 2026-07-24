import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("rr_admin")?.value === "1";
}

export async function PATCH(req: Request) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { studentId, amount } = await req.json();
  if (!studentId || typeof amount !== "number" || amount === 0) {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const { data: student } = await supabaseAdmin
    .from("students")
    .select("coins")
    .eq("id", studentId)
    .single();

  if (!student) return NextResponse.json({ error: "Niet gevonden." }, { status: 404 });

  const newCoins = Math.max(0, student.coins + amount);
  const { error } = await supabaseAdmin
    .from("students")
    .update({ coins: newCoins })
    .eq("id", studentId);

  if (error) return NextResponse.json({ error: "Mislukt." }, { status: 500 });
  return NextResponse.json({ coins: newCoins });
}
