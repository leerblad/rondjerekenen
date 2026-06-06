"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { OPERATION_LABELS, Operation } from "@/lib/math";

type Row = {
  id: string;
  nickname: string;
  grade: number;
  coins: number;
  currentOperation: string;
  doneToday: boolean;
  streak: number;
};

type ProgressData = {
  sessions: {
    id: string;
    date: string;
    operation: string;
    total: number;
    correct: number;
  }[];
  operationStats: {
    operation: string;
    total: number;
    correct: number;
    pct: number;
  }[];
};

export default function Portal() {
  const router = useRouter();
  const { user, ready, setUser, logout } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [classCode, setClassCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);

  const teacher =
    user && user.role === "teacher" ? user : null;

  useEffect(() => {
    if (ready && !teacher) router.replace("/leerkracht");
    if (teacher) setClassCode(teacher.classCode);
  }, [ready, teacher, router]);

  const load = useCallback(async (code: string) => {
    const res = await fetch(`/api/leerkracht/${code}/students`);
    const data = await res.json();
    setRows(data.students || []);
  }, []);

  useEffect(() => {
    if (classCode) load(classCode);
  }, [classCode, load]);

  async function changeGrade(id: string, grade: number) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, grade } : x)));
    await fetch("/api/leerkracht/student", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: id, grade }),
    });
  }

  async function newCode() {
    if (!teacher) return;
    if (
      !confirm(
        "Een nieuwe klascode maken? Bestaande leerlingen houden hun oude code."
      )
    )
      return;
    const res = await fetch("/api/leerkracht/new-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teacherId: teacher.id, name: teacher.name }),
    });
    const data = await res.json();
    if (data.classCode) {
      setUser({ ...teacher, classCode: data.classCode });
      setClassCode(data.classCode);
    }
  }

  async function openStudent(row: Row) {
    setSelected(row);
    setProgress(null);
    const res = await fetch(`/api/leerling/${row.id}/progress`);
    setProgress(await res.json());
  }

  function copy() {
    navigator.clipboard.writeText(classCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!ready || !teacher) return null;

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link href="/" className="text-sm text-dark/50 hover:text-coral">
          ← Home
        </Link>
        <button
          onClick={() => {
            logout();
            router.push("/");
          }}
          className="text-sm text-dark/50 hover:text-coral"
        >
          Uitloggen
        </button>
      </div>

      <h1 className="text-3xl font-extrabold">Hoi {teacher.name} 👋</h1>

      <div className="mt-6 flex flex-col items-start gap-3 rounded-3xl bg-dark p-7 text-white sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-white/60">Jouw klascode</p>
          <p className="font-mono text-4xl font-bold tracking-widest">
            {classCode}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={copy}
            className="rounded-full bg-yellow px-5 py-2 font-semibold text-dark"
          >
            {copied ? "Gekopieerd!" : "Kopieer"}
          </button>
          <button
            onClick={newCode}
            className="rounded-full border border-white/30 px-5 py-2 font-semibold"
          >
            Nieuwe code
          </button>
        </div>
      </div>

      <h2 className="mt-10 text-xl font-bold">Leerlingen ({rows.length})</h2>
      <div className="mt-4 overflow-x-auto rounded-2xl border border-black/5 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-dark/60">
            <tr>
              <th className="px-4 py-3">Naam</th>
              <th className="px-4 py-3">Groep</th>
              <th className="px-4 py-3">Onderdeel</th>
              <th className="px-4 py-3">Vandaag</th>
              <th className="px-4 py-3">Reeks</th>
              <th className="px-4 py-3">Munten</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr
                key={r.id}
                className="cursor-pointer border-t border-black/5 hover:bg-cream/60"
                onClick={() => openStudent(r)}
              >
                <td className="px-4 py-3 font-medium">{r.nickname}</td>
                <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                  <select
                    value={r.grade}
                    onChange={(e) => changeGrade(r.id, Number(e.target.value))}
                    className="rounded-lg border border-black/10 bg-white px-2 py-1"
                  >
                    {[4, 5, 6, 7, 8].map((g) => (
                      <option key={g} value={g}>
                        Groep {g}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {OPERATION_LABELS[r.currentOperation as Operation] ??
                    r.currentOperation}
                </td>
                <td className="px-4 py-3">
                  {r.doneToday ? (
                    <span className="rounded-full bg-green/15 px-2 py-1 text-xs font-semibold text-green">
                      Klaar
                    </span>
                  ) : (
                    <span className="rounded-full bg-coral/15 px-2 py-1 text-xs font-semibold text-coral">
                      Nog niet
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono">{r.streak} 🔥</td>
                <td className="px-4 py-3 font-mono">{r.coins} 🪙</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-dark/40">
                  Nog geen leerlingen. Deel je klascode!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold">{selected.nickname}</h3>
              <button
                onClick={() => setSelected(null)}
                className="text-dark/40"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm text-dark/50">
              Groep {selected.grade} · {selected.coins} munten · reeks{" "}
              {selected.streak}
            </p>

            {!progress && <p className="mt-6 text-dark/40">Laden...</p>}
            {progress && (
              <>
                <h4 className="mt-6 font-semibold">Per onderdeel</h4>
                <div className="mt-2 flex flex-col gap-2">
                  {progress.operationStats.map((s) => (
                    <div key={s.operation}>
                      <div className="flex justify-between text-sm">
                        <span>
                          {OPERATION_LABELS[s.operation as Operation] ??
                            s.operation}
                        </span>
                        <span className="font-mono">{s.pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-cream">
                        <div
                          className="h-2 rounded-full bg-green"
                          style={{ width: `${s.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                  {progress.operationStats.length === 0 && (
                    <p className="text-sm text-dark/40">Nog geen sessies.</p>
                  )}
                </div>

                <h4 className="mt-6 font-semibold">Laatste sessies</h4>
                <div className="mt-2 flex flex-col gap-1 text-sm">
                  {progress.sessions.slice(0, 12).map((s) => (
                    <div
                      key={s.id}
                      className="flex justify-between border-b border-black/5 py-1"
                    >
                      <span>{s.date}</span>
                      <span>
                        {OPERATION_LABELS[s.operation as Operation] ??
                          s.operation}
                      </span>
                      <span className="font-mono">
                        {s.correct}/{s.total}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
