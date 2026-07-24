"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { Illustration } from "@/components/Illustration";
import { AvatarPicker, STUDENT_AVATARS, avatarUrl } from "@/components/AvatarPicker";
import {
  STAGES,
  STAGE_LABELS,
  LEVELS_PER_STAGE,
  MAX_LEVEL,
  levelToStage,
  withinStageLevel,
  getUnlockThreshold,
} from "@/lib/math";

export default function StudentPortal() {
  const router = useRouter();
  const { user, ready, logout, updateStudent } = useAuth();
  const student = user && user.role === "student" ? user : null;

  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("leerling-jongen-1");
  const [savingAvatar, setSavingAvatar] = useState(false);

  useEffect(() => {
    if (ready && !student) router.replace("/leerling");
  }, [ready, student, router]);

  // Auto-open picker if no avatar yet
  useEffect(() => {
    if (student && !student.avatarUrl) setPickingAvatar(true);
  }, [student]);

  async function saveAvatar() {
    if (!student) return;
    setSavingAvatar(true);
    const a = STUDENT_AVATARS.find((x) => x.key === selectedAvatar);
    const url = a ? avatarUrl(a.key, a.ext) : null;
    if (!url) return;
    await fetch("/api/auth/student/avatar", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, avatarUrl: url }),
    });
    updateStudent({ avatarUrl: url });
    setPickingAvatar(false);
    setSavingAvatar(false);
  }

  if (!ready || !student) return null;

  const level = student.level ?? 1;
  const stage = levelToStage(level);
  const wl = withinStageLevel(level);
  const threshold = Math.round(getUnlockThreshold(level) * 100);
  const stageIndex = STAGES.indexOf(stage);

  // Avatar picker overlay
  if (pickingAvatar) {
    return (
      <main className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-6 px-6 py-12 text-center">
        <h1 className="text-2xl font-extrabold">Kies jouw figuur!</h1>
        <AvatarPicker
          avatars={STUDENT_AVATARS}
          selected={selectedAvatar}
          onChange={setSelectedAvatar}
          cols={4}
          activeColor="purple"
        />
        <button
          onClick={saveAvatar}
          disabled={savingAvatar}
          className="w-full rounded-full bg-purple py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
        >
          {savingAvatar ? "Opslaan..." : "Dit ben ik!"}
        </button>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm text-dark/50 hover:text-coral">
          ← Home
        </Link>
        <button
          onClick={() => { logout(); router.push("/"); }}
          className="text-sm text-dark/50 hover:text-coral"
        >
          Uitloggen
        </button>
      </div>

      {/* Welkom */}
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-sm">
        <button
          onClick={() => setPickingAvatar(true)}
          className="group relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-coral/10 transition hover:opacity-80"
          title="Verander je figuur"
        >
          {student.avatarUrl ? (
            <Image src={student.avatarUrl} alt="avatar" width={96} height={96} className="h-full w-full object-cover" />
          ) : (
            <span className="text-5xl">🧒</span>
          )}
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
            Wijzig
          </span>
        </button>
        <h1 className="text-3xl font-extrabold">Hoi {student.nickname}!</h1>
        <p className="flex items-center gap-2 rounded-full bg-yellow/20 px-5 py-2 font-mono text-xl font-bold text-dark">
          <Illustration name="coin" size={22} />
          {student.coins} munten
        </p>
      </div>

      {/* Level info */}
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold">
            Level {level}
            {level >= MAX_LEVEL && " 🏆"}
          </h2>
          <span className="text-sm text-dark/50">
            {STAGE_LABELS[stage]} — {wl}/20
          </span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-cream">
          <div
            className="h-3 rounded-full bg-purple transition-all"
            style={{ width: `${((wl - 1) / LEVELS_PER_STAGE) * 100}%` }}
          />
        </div>
        {level < MAX_LEVEL && (
          <p className="mt-3 text-center text-sm text-dark/50">
            Haal 3 dagen achter elkaar {threshold}% goed om naar level {level + 1} te gaan
          </p>
        )}
      </div>

      {/* Oefenen knop */}
      <Link
        href="/leerling/oefenen"
        className="mt-6 flex items-center justify-center gap-3 rounded-3xl bg-coral py-8 text-center text-3xl font-extrabold text-white shadow-lg transition hover:opacity-90"
      >
        Oefenen!
        <Illustration name="pencil" size={36} />
      </Link>

      {/* Fase overzicht */}
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold">Jouw parcours</h2>
        <div className="flex flex-col gap-2">
          {STAGES.map((s, i) => {
            const done = i < stageIndex;
            const current = i === stageIndex;
            return (
              <div
                key={s}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 ${
                  current
                    ? "bg-purple text-white"
                    : done
                      ? "bg-green/15 text-green"
                      : "bg-cream text-dark/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {done ? (
                    <Illustration name="star" size={20} />
                  ) : current ? (
                    <Illustration name="pencil" size={20} />
                  ) : (
                    <Illustration name="lock" size={20} />
                  )}
                  <span className="font-semibold">{STAGE_LABELS[s]}</span>
                </div>
                {current && <span className="text-sm font-mono opacity-80">{wl}/20</span>}
                {done && <span className="text-sm font-mono opacity-70">✓</span>}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
