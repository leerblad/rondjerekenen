import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin } from "@/lib/supabase";
import { makeClassCode, signToken } from "@/lib/auth";

export async function POST(req: Request) {
  const { name, password } = await req.json();
  if (!name || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Naam en wachtwoord (min. 6 tekens) zijn verplicht." },
      { status: 400 }
    );
  }

  const password_hash = await bcrypt.hash(password, 10);

  // generate a unique class code
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

  const { data, error } = await supabaseAdmin
    .from("teachers")
    .insert({ name, password_hash, class_code })
    .select("id, name, class_code")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: "Registreren mislukt." },
      { status: 500 }
    );
  }

  const token = await signToken({
    role: "teacher",
    id: data.id,
    name: data.name,
    classCode: data.class_code,
  });

  const res = NextResponse.json({
    teacher: { id: data.id, name: data.name, classCode: data.class_code },
  });
  res.cookies.set("rr_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
