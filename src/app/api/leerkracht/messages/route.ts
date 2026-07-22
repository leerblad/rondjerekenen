import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("rr_token")?.value;
  if (!token) return NextResponse.json({ messages: [] });

  const payload = await verifyToken(token).catch(() => null);
  if (!payload || payload.role !== "teacher") {
    return NextResponse.json({ messages: [] });
  }

  const { data } = await supabaseAdmin
    .from("admin_messages")
    .select("id, subject, body, read, sent_at")
    .eq("to_teacher_id", payload.id)
    .order("sent_at", { ascending: false });

  return NextResponse.json({ messages: data ?? [] });
}

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("rr_token")?.value;
  if (!token) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const payload = await verifyToken(token).catch(() => null);
  if (!payload || payload.role !== "teacher") {
    return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  }

  const { messageId } = await req.json();
  await supabaseAdmin
    .from("admin_messages")
    .update({ read: true })
    .eq("id", messageId)
    .eq("to_teacher_id", payload.id);

  return NextResponse.json({ ok: true });
}
