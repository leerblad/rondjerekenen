import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { checkLoginAllowed, recordFailedAttempt, resetAttempts } from "@/lib/loginAttempts";

export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!password) {
    return NextResponse.json({ error: "Wachtwoord vereist." }, { status: 400 });
  }

  const identifier = "admin";
  const check = await checkLoginAllowed(identifier);
  if (!check.allowed) {
    return NextResponse.json(
      { error: `Te veel mislukte pogingen. Probeer het over ${check.minutesLeft} minuten opnieuw.` },
      { status: 429 }
    );
  }

  if (!adminPassword) {
    return NextResponse.json({ error: "Admin niet geconfigureerd." }, { status: 500 });
  }

  let valid = false;
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (adminHash) {
    valid = await bcrypt.compare(String(password), adminHash);
  } else {
    valid = password === adminPassword;
  }

  if (!valid) {
    await recordFailedAttempt(identifier, "admin");
    return NextResponse.json({ error: "Verkeerd wachtwoord." }, { status: 401 });
  }

  await resetAttempts(identifier);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("rr_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("rr_admin");
  return res;
}
