import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { makeClassCode, signToken } from "@/lib/auth";

// Generate a fresh class code for a teacher. Existing students keep their old
// code, so this effectively starts a new class group.
export async function POST(req: Request) {
  const { teacherId, name } = await req.json();
  if (!teacherId) {
    return NextResponse.json({ error: "Ongeldige data." }, { status: 400 });
  }

  let class_code = makeClassCode();
  for (let i = 0; i < 5; i++) {
    const { data } = await supabaseAdmin
      .from("teachers")
      .select("id")
      .eq("class_code", class_code)
      .maybeSingle();
    if (!data) break;
    class_code = makeClassCode();
  }

  const { error } = await supabaseAdmin
    .from("teachers")
    .update({ class_code })
    .eq("id", teacherId);

  if (error) {
    return NextResponse.json(
      { error: "Nieuwe code maken mislukt." },
      { status: 500 }
    );
  }

  const token = await signToken({
    role: "teacher",
    id: teacherId,
    name,
    classCode: class_code,
  });

  const res = NextResponse.json({ classCode: class_code });
  res.cookies.set("rr_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
