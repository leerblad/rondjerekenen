import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/auth";
import { checkLoginAllowed, recordFailedAttempt, resetAttempts } from "@/lib/loginAttempts";

export async function POST(req: Request) {
  const { classCode, nickname, password } = await req.json();
  const code = String(classCode || "").toUpperCase().trim();

  if (!code || !nickname) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const identifier = `student:${code}:${String(nickname).toLowerCase().trim()}`;

  const check = await checkLoginAllowed(identifier);
  if (!check.allowed) {
    return NextResponse.json(
      { error: `Te veel mislukte pogingen. Probeer het over ${check.minutesLeft} minuten opnieuw.` },
      { status: 429 }
    );
  }

  const { data } = await supabaseAdmin
    .from("students")
    .select(
      "id, nickname, class_code, grade, coins, level, background, owned_backgrounds, streak, streak_lost, current_operation, avatar_outfit, avatar_url, password_hash"
    )
    .eq("class_code", code)
    .eq("nickname", nickname)
    .maybeSingle();

  if (!data) {
    await recordFailedAttempt(identifier, "leerling");
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
      await recordFailedAttempt(identifier, "leerling");
      return NextResponse.json({ error: "Verkeerd wachtwoord." }, { status: 401 });
    }
  }

  await resetAttempts(identifier);

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
      ownedBackgrounds: data.owned_backgrounds ?? [],
      streak: data.streak ?? 0,
      streakLost: data.streak_lost ?? 0,
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
