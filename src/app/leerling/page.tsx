"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";

const STUDENT_AVATARS = [
  { key: "leerling-jongen-1", label: "Jongen 1", ext: "png" },
  { key: "leerling-jongen-2", label: "Jongen 2", ext: "png" },
  { key: "leerling-meisje-1", label: "Meisje 1", ext: "png" },
  { key: "leerling-meisje-2", label: "Meisje 2", ext: "png" },
];

function StudentAuth() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [classCode, setClassCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState(4);
  const [avatar, setAvatar] = useState("leerling-jongen-1");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.get("tab") === "register") setTab("register");
  }, [params]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (tab === "register" && password && password !== passwordConfirm) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    try {
      const avatarExt = STUDENT_AVATARS.find((a) => a.key === avatar)?.ext ?? "png";
      const avatarUrl = `/avatars/${avatar}.${avatarExt}`;
      const body =
        tab === "register"
          ? { classCode, nickname, grade, avatarUrl, ...(password ? { password } : {}) }
          : { classCode, nickname, ...(password ? { password } : {}) };
      const res = await fetch(`/api/auth/student/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Er ging iets mis.");
        return;
      }
      setUser({ role: "student", ...data.student });
      router.push("/leerling/portal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-6 text-sm text-dark/50 hover:text-coral">
        ← Terug
      </Link>
      <h1 className="mb-6 text-3xl font-extrabold">Leerling</h1>

      <div className="mb-6 flex rounded-full bg-white p-1 shadow-sm">
        {(["login", "register"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              tab === t ? "bg-purple text-white" : "text-dark/60"
            }`}
          >
            {t === "login" ? "Inloggen" : "Meedoen"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Klascode</span>
          <input
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            className="rounded-xl border border-black/10 bg-white px-4 py-3 font-mono uppercase tracking-widest"
            placeholder="bijv: 3XJK5"
            maxLength={5}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Naam</span>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-4 py-3"
            placeholder="bijv: Lars1 of Mila99"
            required
          />
        </label>
        {tab === "register" && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-sm font-medium">Welke groep zit jij in?</span>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="rounded-xl border border-black/10 bg-white px-4 py-3"
              >
                {[4, 5, 6, 7, 8].map((g) => (
                  <option key={g} value={g}>
                    Groep {g}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium">Kies jouw figuur</span>
              <div className="grid grid-cols-4 gap-2">
                {STUDENT_AVATARS.map((a) => (
                  <button
                    key={a.key}
                    type="button"
                    onClick={() => setAvatar(a.key)}
                    className={`flex flex-col items-center rounded-2xl border-4 bg-white p-2 transition ${
                      avatar === a.key ? "border-purple" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={`/avatars/${a.key}.${a.ext}`}
                      alt={a.label}
                      width={80}
                      height={80}
                      className="h-20 w-20 object-contain"
                    />
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">
            Wachtwoord{tab === "login" ? "" : " (optioneel)"}
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-4 py-3"
            placeholder={tab === "login" ? "wachtwoord" : "laat leeg als je geen wachtwoord wil"}
            minLength={password ? 6 : undefined}
          />
        </label>
        {tab === "register" && password && (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Wachtwoord bevestigen</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3"
              placeholder="herhaal wachtwoord"
            />
          </label>
        )}
        {error && <p className="text-sm text-coral">{error}</p>}
        <button
          disabled={loading}
          className="rounded-full bg-purple py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Bezig..." : tab === "login" ? "Inloggen" : "Meedoen!"}
        </button>
      </form>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <StudentAuth />
    </Suspense>
  );
}
