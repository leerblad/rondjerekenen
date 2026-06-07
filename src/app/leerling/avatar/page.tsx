"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import AvatarCreator from "@/components/AvatarCreator";

export default function AvatarSetup() {
  const router = useRouter();
  const { user, ready, updateStudent } = useAuth();
  const student = user?.role === "student" ? user : null;
  const [saving, setSaving] = useState(false);

  // Wait for auth — if not logged in, go back
  useEffect(() => {
    if (ready && !student) router.replace("/leerling");
  }, [ready, student, router]);

  const handleCreated = useCallback(async (glbUrl: string) => {
    if (!student) return;
    setSaving(true);
    await fetch("/api/student/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, avatarUrl: glbUrl }),
    });
    updateStudent({ avatarUrl: glbUrl });
    router.push("/leerling/portal");
  }, [student, updateStudent, router]);

  // Don't render iframe until auth is ready
  if (!ready || !student) {
    return (
      <main className="flex h-screen items-center justify-center bg-dark">
        <p className="text-white/40">Laden...</p>
      </main>
    );
  }

  return (
    <main className="flex h-screen flex-col bg-dark">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-xl font-bold text-white">Maak jouw avatar</h1>
        {saving && <p className="text-sm text-white/60">Opslaan...</p>}
        <button
          onClick={() => router.push("/leerling/portal")}
          className="rounded-full bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
        >
          Overslaan
        </button>
      </div>
      <div className="flex-1 px-4 pb-4">
        <AvatarCreator onCreated={handleCreated} />
      </div>
    </main>
  );
}
