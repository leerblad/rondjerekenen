"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

function StudentAuth() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [classCode, setClassCode] = useState("");
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState(4);
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
      const body =
        tab === "register"
          ? { classCode, nickname, grade, ...(password ? { password } : {}) }
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
            placeholder="3XJK5"
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
            placeholder="Lars1"
            required
          />
        </label>
        {tab === "register" && (
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
          {loading
            ? "Bezig..."
            : tab === "login"
              ? "Inloggen"
              : "Meedoen!"}
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
