import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Hash of "adminHesterbold2" — stored as env var ADMIN_PASSWORD_HASH or compared plaintext via ADMIN_PASSWORD
export async function POST(req: Request) {
  const { password } = await req.json();
  const adminPassword = process.env.ADMIN_PASSWORD ?? "adminHesterbold2";

  if (!password) {
    return NextResponse.json({ error: "Wachtwoord vereist." }, { status: 400 });
  }

  let valid = false;
  // Support both plaintext env var and bcrypt hash env var
  const adminHash = process.env.ADMIN_PASSWORD_HASH;
  if (adminHash) {
    valid = await bcrypt.compare(String(password), adminHash);
  } else {
    valid = password === adminPassword;
  }

  if (!valid) {
    return NextResponse.json({ error: "Verkeerd wachtwoord." }, { status: 401 });
  }

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
