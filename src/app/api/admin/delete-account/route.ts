import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("rr_admin")?.value === "1";
}

export async function DELETE(req: Request) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { type, id } = await req.json() as { type: "teacher" | "student"; id: string };
  if (!type || !id) return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });

  const table = type === "teacher" ? "teachers" : "students";
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Verwijderen mislukt." }, { status: 500 });

  return NextResponse.json({ ok: true });
}
