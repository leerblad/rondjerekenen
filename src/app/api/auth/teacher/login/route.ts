import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, password } = await req.json();
  if (!name || !password) {
    return NextResponse.json({ error: "Vul alle velden in." }, { status: 400 });
  }

  const { data } = await supabaseAdmin
    .from("teachers")
    .select("id, name, class_code, password_hash, avatar_url")
    .eq("name", name)
    .maybeSingle();

  if (!data || !(await bcrypt.compare(password, data.password_hash))) {
    return NextResponse.json(
      { error: "Onjuiste naam of wachtwoord." },
      { status: 401 }
    );
  }

  const token = await signToken({
    role: "teacher",
    id: data.id,
    name: data.name,
    classCode: data.class_code,
  });

  const res = NextResponse.json({
    teacher: { id: data.id, name: data.name, classCode: data.class_code, avatarUrl: data.avatar_url },
  });
  res.cookies.set("rr_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
