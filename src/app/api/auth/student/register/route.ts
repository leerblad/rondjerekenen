import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { classCode, nickname, grade, password, avatarUrl } = await req.json();
  const code = String(classCode || "").toUpperCase().trim();
  const g = Number(grade);

  if (!code || !nickname || !(g >= 4 && g <= 8)) {
    return NextResponse.json(
      { error: "Vul klascode, naam en groep (4 t/m 8) in." },
      { status: 400 }
    );
  }

  const { data: teacher } = await supabaseAdmin
    .from("teachers")
    .select("class_code")
    .eq("class_code", code)
    .maybeSingle();

  if (!teacher) {
    return NextResponse.json(
      { error: "Klascode bestaat niet." },
      { status: 404 }
    );
  }

  const insertData: Record<string, unknown> = { nickname, class_code: code, grade: g, avatar_url: avatarUrl || null };
  if (password && password.length >= 6) {
    insertData.password_hash = await bcrypt.hash(password, 10);
  }

  const { data, error } = await supabaseAdmin
    .from("students")
    .insert(insertData)
    .select(
      "id, nickname, class_code, grade, coins, level, current_operation, avatar_outfit, avatar_url"
    )
    .single();

  if (error || !data) {
    if (error?.code === "23505") {
      return NextResponse.json(
        { error: "Deze naam bestaat al in jouw klas. Kies een andere." },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: "Registreren mislukt." }, { status: 500 });
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
