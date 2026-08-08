"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Inloggen mislukt.");
        return;
      }
      router.push("/admin");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12"
      style={{ background: "#FAF6F0" }}
    >
      <h1 className="mb-2 text-3xl font-extrabold" style={{ color: "#1A1A1A" }}>
        Admin
      </h1>
      <p className="mb-8 text-sm" style={{ color: "rgba(26,26,26,0.5)" }}>
        Beheerderspagina, niet delen
      </p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium" style={{ color: "#1A1A1A" }}>
            Wachtwoord
          </span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border px-4 py-3"
            style={{ borderColor: "rgba(0,0,0,0.1)", background: "white" }}
            required
            autoFocus
          />
        </label>
        {error && <p className="text-sm" style={{ color: "#E8705A" }}>{error}</p>}
        <button
          disabled={loading}
          className="rounded-full py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          style={{ background: "#E8705A" }}
        >
          {loading ? "Bezig..." : "Inloggen"}
        </button>
      </form>
    </main>
  );
}
