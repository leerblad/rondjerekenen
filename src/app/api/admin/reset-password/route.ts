import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";
import bcrypt from "bcryptjs";

async function checkAdminCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("rr_admin")?.value === "1";
}

export async function PATCH(req: Request) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { teacherId, newPassword } = await req.json();
  if (!teacherId || !newPassword || newPassword.length < 6) {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }
  const hash = await bcrypt.hash(newPassword, 10);
  const { error } = await supabaseAdmin
    .from("teachers")
    .update({ password_hash: hash })
    .eq("id", teacherId);
  if (error) return NextResponse.json({ error: "Reset mislukt." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
