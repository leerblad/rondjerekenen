import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { classCode, nickname } = await req.json();
  const code = String(classCode || "").toUpperCase().trim();

  if (!code || !nickname) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("students")
    .select(
      "id, nickname, class_code, grade, coins, current_operation, avatar_outfit"
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
      currentOperation: data.current_operation,
      avatarOutfit: data.avatar_outfit,
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
