import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/auth";
import { checkLoginAllowed, recordFailedAttempt, resetAttempts } from "@/lib/loginAttempts";

export async function POST(req: Request) {
  const { name, password } = await req.json();
  if (!name || !password) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const identifier = `teacher:${String(name).toLowerCase().trim()}`;

  const check = await checkLoginAllowed(identifier);
  if (!check.allowed) {
    return NextResponse.json(
      { error: `Te veel mislukte pogingen. Probeer het over ${check.minutesLeft} minuten opnieuw.` },
      { status: 429 }
    );
  }

  const { data } = await supabaseAdmin
    .from("teachers")
    .select("id, name, class_code, password_hash")
    .eq("name", name)
    .maybeSingle();

  if (!data || !(await bcrypt.compare(password, data.password_hash))) {
    await recordFailedAttempt(identifier, "leerkracht");
    return NextResponse.json(
      { error: "Onjuiste naam of wachtwoord." },
      { status: 401 }
    );
  }

  await resetAttempts(identifier);

  // Fetch avatar separately — column may not exist on older DB schemas
  const { data: extra } = await supabaseAdmin
    .from("teachers")
    .select("avatar_url")
    .eq("id", data.id)
    .maybeSingle();

  const token = await signToken({
    role: "teacher",
    id: data.id,
    name: data.name,
    classCode: data.class_code,
  });

  const res = NextResponse.json({
    teacher: { id: data.id, name: data.name, classCode: data.class_code, avatarUrl: extra?.avatar_url ?? null },
  });
  res.cookies.set("rr_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
