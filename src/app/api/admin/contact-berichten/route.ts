import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabaseAdmin } from "@/lib/supabase";

async function checkAdminCookie() {
  const cookieStore = await cookies();
  return cookieStore.get("rr_admin")?.value === "1";
}

// GET  — haal alle berichten op
// PATCH — markeer als gelezen: body { id }
export async function GET() {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }

  const { data, error } = await supabaseAdmin
    .from("contact_messages")
    .select("id, teacher_id, teacher_name, subject, message, sent_at, read")
    .order("sent_at", { ascending: false });

  if (error) return NextResponse.json({ messages: [] });
  return NextResponse.json({ messages: data ?? [] });
}

export async function PATCH(req: Request) {
  if (!(await checkAdminCookie())) {
    return NextResponse.json({ error: "Niet geautoriseerd." }, { status: 401 });
  }
  const { id } = await req.json();
  await supabaseAdmin.from("contact_messages").update({ read: true }).eq("id", id);
  return NextResponse.json({ ok: true });
}
