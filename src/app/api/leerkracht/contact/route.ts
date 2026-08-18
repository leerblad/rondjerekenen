import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// POST /api/leerkracht/contact
// Body: { teacherId, name, subject, message }
// Rate limit: max 3 berichten per uur per leerkracht
export async function POST(req: Request) {
  const body = await req.json();
  const { teacherId, name, subject, message } = body;

  if (!teacherId || !message?.trim()) {
    return NextResponse.json({ error: "Ontbrekende velden." }, { status: 400 });
  }

  // Rate limit: tel berichten van de afgelopen 60 minuten
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabaseAdmin
    .from("contact_messages")
    .select("id", { count: "exact", head: true })
    .eq("teacher_id", teacherId)
    .gte("sent_at", oneHourAgo);

  if ((count ?? 0) >= 3) {
    return NextResponse.json(
      { error: "Je hebt de afgelopen 60 minuten al 3 berichten gestuurd. Probeer het later opnieuw." },
      { status: 429 }
    );
  }

  const { error } = await supabaseAdmin.from("contact_messages").insert({
    teacher_id: teacherId,
    teacher_name: name ?? null,
    subject: subject?.trim() || null,
    message: message.trim(),
    sent_at: new Date().toISOString(),
    read: false,
  });

  if (error) {
    return NextResponse.json({ error: "Opslaan mislukt." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
