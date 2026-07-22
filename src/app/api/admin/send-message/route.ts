import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("rr_admin")?.value === "1";
}

export async function POST(req: Request) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { toTeacherId, subject, body } = await req.json();
  if (!toTeacherId || !subject || !body) {
    return NextResponse.json({ error: "Alle velden zijn verplicht." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("admin_messages")
    .insert({ to_teacher_id: toTeacherId, subject, body });

  if (error) {
    return NextResponse.json({ error: "Bericht sturen mislukt." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
