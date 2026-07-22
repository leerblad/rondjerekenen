"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Teacher {
  id: string;
  name: string;
  email: string | null;
  class_code: string;
  created_at: string;
}

interface Student {
  id: string;
  nickname: string;
  class_code: string;
  grade: number;
  coins: number;
  current_operation: string;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetPasswords, setResetPasswords] = useState<Record<string, string>>({});
  const [resetStatus, setResetStatus] = useState<Record<string, string>>({});
  const [msgSubjects, setMsgSubjects] = useState<Record<string, string>>({});
  const [msgBodies, setMsgBodies] = useState<Record<string, string>>({});
  const [msgStatus, setMsgStatus] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/accounts")
      .then(async (res) => {
        if (res.status === 401) {
          router.replace("/admin/login");
          return;
        }
        const data = await res.json();
        setTeachers(data.teachers ?? []);
        setStudents(data.students ?? []);
      })
      .finally(() => setLoading(false));
  }, [router]);

  async function resetPassword(teacherId: string) {
    const newPassword = resetPasswords[teacherId] ?? "";
    if (newPassword.length < 6) {
      setResetStatus((s) => ({ ...s, [teacherId]: "Minimaal 6 tekens." }));
      return;
    }
    setResetStatus((s) => ({ ...s, [teacherId]: "Bezig..." }));
    const res = await fetch("/api/admin/reset-password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId, newPassword }),
    });
    const data = await res.json();
    setResetStatus((s) => ({
      ...s,
      [teacherId]: res.ok ? "✓ Wachtwoord gereset!" : data.error ?? "Mislukt.",
    }));
    if (res.ok) setResetPasswords((p) => ({ ...p, [teacherId]: "" }));
  }

  async function sendMessage(teacherId: string) {
    const subject = msgSubjects[teacherId] ?? "";
    const body = msgBodies[teacherId] ?? "";
    if (!subject || !body) {
      setMsgStatus((s) => ({ ...s, [teacherId]: "Vul onderwerp en bericht in." }));
      return;
    }
    setMsgStatus((s) => ({ ...s, [teacherId]: "Bezig..." }));
    const res = await fetch("/api/admin/send-message", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toTeacherId: teacherId, subject, body }),
    });
    const data = await res.json();
    setMsgStatus((s) => ({
      ...s,
      [teacherId]: res.ok ? "✓ Bericht verstuurd!" : data.error ?? "Mislukt.",
    }));
    if (res.ok) {
      setMsgSubjects((s) => ({ ...s, [teacherId]: "" }));
      setMsgBodies((s) => ({ ...s, [teacherId]: "" }));
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ background: "#FAF6F0" }}>
        <p style={{ color: "rgba(26,26,26,0.5)" }}>Laden…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-10" style={{ background: "#FAF6F0", color: "#1A1A1A" }}>
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-extrabold">Beheerderspagina</h1>
            <p
              className="mt-1 rounded-lg px-3 py-1 text-sm font-semibold inline-block"
              style={{ background: "#E8705A", color: "white" }}
            >
              ⚠ Niet delen
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-full px-4 py-2 text-sm font-semibold transition hover:opacity-80"
            style={{ background: "rgba(26,26,26,0.08)", color: "#1A1A1A" }}
          >
            Uitloggen
          </button>
        </div>

        {/* Teachers */}
        {teachers.map((teacher) => {
          const teacherStudents = students.filter(
            (s) => s.class_code === teacher.class_code
          );

          return (
            <div
              key={teacher.id}
              className="mb-8 rounded-2xl shadow-sm overflow-hidden"
              style={{ background: "white" }}
            >
              {/* Teacher header */}
              <div
                className="px-6 py-4"
                style={{ background: "#8B7FC7" }}
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-xl font-bold text-white">{teacher.name}</span>
                  <span
                    className="rounded-full px-3 py-0.5 text-xs font-mono font-semibold"
                    style={{ background: "rgba(255,255,255,0.2)", color: "white" }}
                  >
                    {teacher.class_code}
                  </span>
                  <span className="text-sm text-white/80">{teacher.email ?? "—"}</span>
                  <span className="ml-auto text-sm text-white/70">
                    {teacherStudents.length} leerling{teacherStudents.length !== 1 ? "en" : ""}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/60">
                  Aangemeld: {new Date(teacher.created_at).toLocaleDateString("nl-NL")}
                </p>
              </div>

              <div className="px-6 py-4">
                {/* Students table */}
                {teacherStudents.length > 0 ? (
                  <div className="overflow-x-auto mb-6">
                    <table className="w-full text-sm">
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                          <th className="pb-2 text-left font-semibold text-dark/50">Naam</th>
                          <th className="pb-2 text-left font-semibold text-dark/50">Groep</th>
                          <th className="pb-2 text-left font-semibold text-dark/50">Munten</th>
                          <th className="pb-2 text-left font-semibold text-dark/50">Bewerking</th>
                          <th className="pb-2 text-left font-semibold text-dark/50">Aangemeld</th>
                        </tr>
                      </thead>
                      <tbody>
                        {teacherStudents.map((s) => (
                          <tr
                            key={s.id}
                            style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                          >
                            <td className="py-2 font-medium">{s.nickname}</td>
                            <td className="py-2">{s.grade}</td>
                            <td className="py-2" style={{ color: "#F5C842" }}>
                              {s.coins}
                            </td>
                            <td className="py-2">{s.current_operation ?? "—"}</td>
                            <td className="py-2 text-dark/50">
                              {new Date(s.created_at).toLocaleDateString("nl-NL")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="mb-6 text-sm" style={{ color: "rgba(26,26,26,0.4)" }}>
                    Nog geen leerlingen.
                  </p>
                )}

                {/* Password reset */}
                <div className="mb-4">
                  <p className="mb-2 text-sm font-semibold">Wachtwoord resetten</p>
                  <div className="flex gap-2">
                    <input
                      type="password"
                      value={resetPasswords[teacher.id] ?? ""}
                      onChange={(e) =>
                        setResetPasswords((p) => ({ ...p, [teacher.id]: e.target.value }))
                      }
                      placeholder="Nieuw wachtwoord (min. 6)"
                      className="flex-1 rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: "rgba(0,0,0,0.12)" }}
                    />
                    <button
                      onClick={() => resetPassword(teacher.id)}
                      className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                      style={{ background: "#E8705A" }}
                    >
                      Resetten
                    </button>
                  </div>
                  {resetStatus[teacher.id] && (
                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: resetStatus[teacher.id]?.startsWith("✓")
                          ? "#3AB54A"
                          : "#E8705A",
                      }}
                    >
                      {resetStatus[teacher.id]}
                    </p>
                  )}
                </div>

                {/* Send message */}
                <div>
                  <p className="mb-2 text-sm font-semibold">Bericht sturen</p>
                  <input
                    type="text"
                    value={msgSubjects[teacher.id] ?? ""}
                    onChange={(e) =>
                      setMsgSubjects((s) => ({ ...s, [teacher.id]: e.target.value }))
                    }
                    placeholder="Onderwerp"
                    className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
                    style={{ borderColor: "rgba(0,0,0,0.12)" }}
                  />
                  <textarea
                    value={msgBodies[teacher.id] ?? ""}
                    onChange={(e) =>
                      setMsgBodies((s) => ({ ...s, [teacher.id]: e.target.value }))
                    }
                    placeholder="Bericht"
                    rows={3}
                    className="mb-2 w-full rounded-xl border px-3 py-2 text-sm"
                    style={{ borderColor: "rgba(0,0,0,0.12)" }}
                  />
                  <button
                    onClick={() => sendMessage(teacher.id)}
                    className="rounded-xl px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
                    style={{ background: "#3AB54A" }}
                  >
                    Versturen
                  </button>
                  {msgStatus[teacher.id] && (
                    <p
                      className="mt-1 text-xs"
                      style={{
                        color: msgStatus[teacher.id]?.startsWith("✓")
                          ? "#3AB54A"
                          : "#E8705A",
                      }}
                    >
                      {msgStatus[teacher.id]}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {teachers.length === 0 && (
          <p style={{ color: "rgba(26,26,26,0.4)" }}>Nog geen leerkrachten.</p>
        )}
      </div>
    </main>
  );
}
