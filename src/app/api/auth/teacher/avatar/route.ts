import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(req: Request) {
  const { teacherId, avatarUrl } = await req.json();
  if (!teacherId || !avatarUrl) {
    return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });
  }
  const { error } = await supabaseAdmin
    .from("teachers")
    .update({ avatar_url: avatarUrl })
    .eq("id", teacherId);
  if (error) return NextResponse.json({ error: "Opslaan mislukt." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
