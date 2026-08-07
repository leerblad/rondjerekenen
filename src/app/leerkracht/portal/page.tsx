"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { OPERATION_LABELS, Operation, STAGE_LABELS, LEVELS_PER_STAGE, levelToStage, withinStageLevel, GRADE_STAGES, GRADE_START_LEVEL, type Grade } from "@/lib/math";
import { Illustration } from "@/components/Illustration";

type Message = {
  id: string;
  subject: string;
  body: string;
  read: boolean;
  sent_at: string;
};

type Row = {
  id: string;
  nickname: string;
  grade: number;
  coins: number;
  level: number;
  currentOperation: string;
  doneToday: boolean;
  busyToday: boolean;
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
  hardestQuestions: {
    question: string;
    total: number;
    wrong: number;
    pct_wrong: number;
  }[];
  dailyScores: {
    date: string;
    pct: number;
  }[];
};

function barColor(pct: number) {
  if (pct >= 80) return "#3AB54A";
  if (pct >= 50) return "#F5C842";
  return "#E8705A";
}

function DailyChart({ data }: { data: { date: string; pct: number }[] }) {
  const W = 300;
  const H = 150;
  const padL = 28;
  const padB = 18;
  const padT = 6;
  const chartW = W - padL;
  const chartH = H - padB - padT;
  const n = data.length || 1;
  const slot = chartW / n;
  const barW = slot * 0.6;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Dagelijkse scores">
      {/* y-axis labels + gridlines */}
      {[0, 50, 100].map((y) => {
        const yPos = padT + chartH - (y / 100) * chartH;
        return (
          <g key={y}>
            <line
              x1={padL}
              y1={yPos}
              x2={W}
              y2={yPos}
              stroke="#1A1A1A"
              strokeOpacity={0.08}
            />
            <text x={padL - 4} y={yPos + 3} textAnchor="end" fontSize="8" fill="#1A1A1A" fillOpacity={0.5}>
              {y}%
            </text>
          </g>
        );
      })}
      {/* bars */}
      {data.map((d, i) => {
        const x = padL + i * slot + (slot - barW) / 2;
        const h = (d.pct / 100) * chartH;
        const y = padT + chartH - h;
        return (
          <g key={d.date}>
            <rect x={x} y={y} width={barW} height={h} rx={1.5} fill={barColor(d.pct)} />
            <text
              x={x + barW / 2}
              y={H - 6}
              textAnchor="middle"
              fontSize="7"
              fill="#1A1A1A"
              fillOpacity={0.5}
            >
              {Number(d.date.slice(8, 10))}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Portal() {
  const router = useRouter();
  const { user, ready, setUser, logout } = useAuth();
  const [rows, setRows] = useState<Row[]>([]);
  const [classCode, setClassCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [selected, setSelected] = useState<Row | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [openMsg, setOpenMsg] = useState<Message | null>(null);

  const teacher =
    user && user.role === "teacher" ? user : null;

  useEffect(() => {
    if (ready && !teacher) router.replace("/leerkracht");
    if (teacher) setClassCode(teacher.classCode);
  }, [ready, teacher, router]);

  useEffect(() => {
    if (!teacher) return;
    fetch("/api/leerkracht/messages")
      .then((r) => r.json())
      .then((d) => setMessages(d.messages ?? []));
  }, [teacher]);

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

  async function changeLevel(id: string, level: number) {
    setRows((r) => r.map((x) => (x.id === id ? { ...x, level } : x)));
    setSelected((s) => s && s.id === id ? { ...s, level } : s);
    await fetch("/api/leerkracht/student", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: id, level }),
    });
  }

  async function resetPassword(id: string) {
    const newPassword = prompt("Nieuw wachtwoord voor deze leerling (minimaal 4 tekens):");
    if (!newPassword || newPassword.length < 4) return;
    const res = await fetch("/api/leerkracht/student", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: id, newPassword }),
    });
    if (res.ok) alert("Wachtwoord aangepast!");
    else alert("Er ging iets mis.");
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

  async function openMessage(msg: Message) {
    setOpenMsg(msg);
    if (!msg.read) {
      await fetch("/api/leerkracht/messages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: msg.id }),
      });
      setMessages((ms) => ms.map((m) => m.id === msg.id ? { ...m, read: true } : m));
    }
  }

  if (!ready || !teacher) return null;

  const unread = messages.filter((m) => !m.read);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10">
      {unread.length > 0 && (
        <div
          className="mb-6 flex items-center justify-between rounded-2xl px-5 py-4"
          style={{ background: "#F5C842" }}
        >
          <div className="cursor-pointer" onClick={() => setOpenMsg(unread[0])}>
            <p className="font-semibold text-dark">
              📬 Je hebt {unread.length} nieuw{unread.length !== 1 ? "e" : ""} bericht{unread.length !== 1 ? "en" : ""} van de beheerder
            </p>
            <p className="text-sm text-dark/70 mt-0.5">Klik om te lezen</p>
          </div>
          <button
            onClick={async () => {
              for (const msg of unread) {
                await fetch("/api/leerkracht/messages", {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ messageId: msg.id }),
                });
              }
              setMessages((ms) => ms.map((m) => ({ ...m, read: true })));
            }}
            className="ml-4 flex-shrink-0 rounded-full bg-black/10 px-3 py-1 text-sm font-semibold text-dark hover:bg-black/20"
          >
            ✕ Sluiten
          </button>
        </div>
      )}
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

      <div className="flex items-center gap-4">
        {teacher.avatarUrl && (
          <div className="h-16 w-16 overflow-hidden rounded-full bg-coral/10">
            <Image src={teacher.avatarUrl} alt="avatar" width={64} height={64} className="h-full w-full object-cover" />
          </div>
        )}
        <h1 className="text-3xl font-extrabold">Hoi {teacher.name} 👋</h1>
      </div>

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
                  ) : r.busyToday ? (
                    <span className="rounded-full bg-yellow/30 px-2 py-1 text-xs font-semibold text-dark">
                      Bezig
                    </span>
                  ) : (
                    <span className="rounded-full bg-coral/15 px-2 py-1 text-xs font-semibold text-coral">
                      Nog niet
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 font-mono">{r.streak} 🔥</td>
                <td className="px-4 py-3 font-mono">
                  <span className="flex items-center gap-1">
                    {r.coins}
                    <Illustration name="coin" size={16} />
                  </span>
                </td>
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

      {openMsg && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpenMsg(null)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-7"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">{openMsg.subject}</h3>
              <button onClick={() => { setOpenMsg(null); }} className="text-dark/40">✕</button>
            </div>
            <p className="text-sm text-dark/50 mb-4">
              {new Date(openMsg.sent_at).toLocaleString("nl-NL")}
            </p>
            <p className="text-dark/80 whitespace-pre-wrap">{openMsg.body}</p>
            {messages.length > 1 && (
              <div className="mt-6 border-t border-black/5 pt-4">
                <p className="text-sm font-semibold mb-2">Alle berichten</p>
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`cursor-pointer py-2 text-sm border-b border-black/5 ${m.id === openMsg.id ? "font-semibold" : ""}`}
                    onClick={() => openMessage(m)}
                  >
                    {!m.read && <span className="mr-1 text-coral">●</span>}
                    {m.subject}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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

            {/* Level aanpassen — groep → blok → level */}
            <div className="mt-4 rounded-2xl bg-cream p-4">
              <p className="mb-2 text-sm font-semibold">Level aanpassen</p>
              <div className="flex flex-col gap-2">
                {/* Groep */}
                <div className="flex items-center gap-2">
                  <label className="w-20 text-xs text-dark/60">Groep</label>
                  <select
                    value={Math.floor((selected.level ?? 1) <= 120 ? 4 : (selected.level ?? 1) <= 240 ? 5 : (selected.level ?? 1) <= 360 ? 6 : (selected.level ?? 1) <= 480 ? 7 : 8)}
                    onChange={(e) => {
                      const g = Number(e.target.value) as Grade;
                      changeLevel(selected.id, GRADE_START_LEVEL[g]);
                    }}
                    className="flex-1 rounded-lg border border-black/10 bg-white px-2 py-1 text-sm"
                  >
                    {([4,5,6,7,8] as Grade[]).map((g) => (
                      <option key={g} value={g}>Groep {g}</option>
                    ))}
                  </select>
                </div>
                {/* Blok */}
                <div className="flex items-center gap-2">
                  <label className="w-20 text-xs text-dark/60">Blok</label>
                  <select
                    value={levelToStage(selected.level ?? 1)}
                    onChange={(e) => {
                      const stage = e.target.value as keyof typeof STAGE_LABELS;
                      const g = Math.floor((selected.level ?? 1) <= 120 ? 4 : (selected.level ?? 1) <= 240 ? 5 : (selected.level ?? 1) <= 360 ? 6 : (selected.level ?? 1) <= 480 ? 7 : 8) as Grade;
                      const stageIdx = GRADE_STAGES[g].indexOf(stage as typeof GRADE_STAGES[typeof g][number]);
                      const newLevel = GRADE_START_LEVEL[g] + stageIdx * LEVELS_PER_STAGE;
                      changeLevel(selected.id, newLevel + 1);
                    }}
                    className="flex-1 rounded-lg border border-black/10 bg-white px-2 py-1 text-sm"
                  >
                    {(() => {
                      const g = Math.floor((selected.level ?? 1) <= 120 ? 4 : (selected.level ?? 1) <= 240 ? 5 : (selected.level ?? 1) <= 360 ? 6 : (selected.level ?? 1) <= 480 ? 7 : 8) as Grade;
                      return GRADE_STAGES[g].map((s) => (
                        <option key={s} value={s}>{STAGE_LABELS[s]}</option>
                      ));
                    })()}
                  </select>
                </div>
                {/* Level binnen blok */}
                <div className="flex items-center gap-2">
                  <label className="w-20 text-xs text-dark/60">Level (1–20)</label>
                  <select
                    value={withinStageLevel(selected.level ?? 1)}
                    onChange={(e) => {
                      const g = Math.floor((selected.level ?? 1) <= 120 ? 4 : (selected.level ?? 1) <= 240 ? 5 : (selected.level ?? 1) <= 360 ? 6 : (selected.level ?? 1) <= 480 ? 7 : 8) as Grade;
                      const stageIdx = GRADE_STAGES[g].indexOf(levelToStage(selected.level ?? 1) as typeof GRADE_STAGES[typeof g][number]);
                      const newLevel = GRADE_START_LEVEL[g] + stageIdx * LEVELS_PER_STAGE + Number(e.target.value) - 1;
                      changeLevel(selected.id, newLevel);
                    }}
                    className="flex-1 rounded-lg border border-black/10 bg-white px-2 py-1 text-sm"
                  >
                    {Array.from({ length: LEVELS_PER_STAGE }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>Level {n}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-dark/40">
                  Huidig blok: {STAGE_LABELS[levelToStage(selected.level ?? 1)]}, level {withinStageLevel(selected.level ?? 1)} van 20
                </p>
              </div>
            </div>

            {/* Wachtwoord resetten */}
            <div className="mt-4 rounded-2xl border border-black/10 p-4">
              <p className="text-sm font-semibold mb-2">Wachtwoord</p>
              <button
                onClick={() => resetPassword(selected.id)}
                className="rounded-full border border-coral px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral hover:text-white"
              >
                Wachtwoord opnieuw instellen
              </button>
            </div>

            {!progress && <p className="mt-6 text-dark/40">Laden...</p>}
            {progress && (
              <>
                {progress.dailyScores && progress.dailyScores.length > 0 && (
                  <>
                    <h4 className="mt-6 font-semibold">
                      Scores afgelopen 14 dagen
                    </h4>
                    <div className="mt-2 overflow-x-auto">
                      <DailyChart data={progress.dailyScores} />
                    </div>
                  </>
                )}

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

                {progress.hardestQuestions &&
                  progress.hardestQuestions.length > 0 && (
                    <>
                      <h4 className="mt-6 font-semibold">Moeilijkste sommen</h4>
                      <div className="mt-2 flex flex-col gap-2">
                        {progress.hardestQuestions.map((q) => (
                          <div key={q.question}>
                            <div className="flex justify-between text-sm">
                              <span className="font-mono">{q.question}</span>
                              <span className="font-mono">
                                {q.pct_wrong}% fout
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-cream">
                              <div
                                className="h-2 rounded-full bg-coral"
                                style={{ width: `${q.pct_wrong}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

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
