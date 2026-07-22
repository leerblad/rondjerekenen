"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";

function TeacherAuth() {
  const router = useRouter();
  const params = useSearchParams();
  const { setUser } = useAuth();
  const [tab, setTab] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
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

    if (tab === "register" && password !== passwordConfirm) {
      setError("Wachtwoorden komen niet overeen.");
      return;
    }

    setLoading(true);
    try {
      const body =
        tab === "register"
          ? { name, email, password }
          : { name, password };
      const res = await fetch(`/api/auth/teacher/${tab}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Er ging iets mis.");
        return;
      }
      setUser({ role: "teacher", ...data.teacher });
      router.push("/leerkracht/portal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <Link href="/" className="mb-6 text-sm text-dark/50 hover:text-coral">
        ← Terug
      </Link>
      <h1 className="mb-6 text-3xl font-extrabold">Leerkracht</h1>

      <div className="mb-6 flex rounded-full bg-white p-1 shadow-sm">
        {(["login", "register"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 rounded-full py-2 text-sm font-semibold transition ${
              tab === t ? "bg-coral text-white" : "text-dark/60"
            }`}
          >
            {t === "login" ? "Inloggen" : "Registreren"}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Naam</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-4 py-3"
            placeholder="Juf Megan"
            required
          />
        </label>
        {tab === "register" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">E-mailadres</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3"
              placeholder="juf@school.nl"
              required
            />
          </label>
        )}
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Wachtwoord</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-black/10 bg-white px-4 py-3"
            placeholder="minimaal 6 tekens"
            minLength={6}
            required
          />
        </label>
        {tab === "register" && (
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Wachtwoord bevestigen</span>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="rounded-xl border border-black/10 bg-white px-4 py-3"
              placeholder="herhaal wachtwoord"
              minLength={6}
              required
            />
          </label>
        )}
        {error && <p className="text-sm text-coral">{error}</p>}
        <button
          disabled={loading}
          className="rounded-full bg-coral py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {loading
            ? "Bezig..."
            : tab === "login"
              ? "Inloggen"
              : "Account aanmaken"}
        </button>
      </form>

      {tab === "login" && (
        <p className="mt-4 text-center text-sm text-dark/50">
          Wachtwoord vergeten?{" "}
          <Link href="/leerkracht/reset" className="text-coral hover:underline">
            Klik hier
          </Link>
        </p>
      )}
    </main>
  );
}

export default function Page() {
  return (
    <Suspense>
      <TeacherAuth />
    </Suspense>
  );
}
