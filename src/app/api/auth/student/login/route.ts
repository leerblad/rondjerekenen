import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { classCode, nickname, password } = await req.json();
  const code = String(classCode || "").toUpperCase().trim();

  if (!code || !nickname) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("students")
    .select(
      "id, nickname, class_code, grade, coins, level, background, current_operation, avatar_outfit, avatar_url, password_hash"
    )
    .eq("class_code", code)
    .eq("nickname", nickname)
    .maybeSingle();

  if (!data) {
    return NextResponse.json(
      { error: "Geen leerling gevonden met deze naam en klascode." },
      { status: 404 }
    );
  }

  // If the student has a password_hash, verify the password
  if (data.password_hash) {
    if (!password) {
      return NextResponse.json({ error: "Vul je wachtwoord in." }, { status: 401 });
    }
    const valid = await bcrypt.compare(String(password), data.password_hash);
    if (!valid) {
      return NextResponse.json({ error: "Verkeerd wachtwoord." }, { status: 401 });
    }
  }

  const token = await signToken({
    role: "student",
    id: data.id,
    classCode: data.class_code,
  });

  const res = NextResponse.json({
    student: {
      id: data.id,
      nickname: data.nickname,
      classCode: data.class_code,
      grade: data.grade,
      coins: data.coins,
      level: data.level ?? 1,
      background: data.background ?? null,
      currentOperation: data.current_operation,
      avatarOutfit: data.avatar_outfit,
      avatarUrl: data.avatar_url,
    },
  });
  res.cookies.set("rr_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
