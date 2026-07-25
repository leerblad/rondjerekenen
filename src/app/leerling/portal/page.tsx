"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { Illustration } from "@/components/Illustration";
import { AvatarPicker, STUDENT_AVATARS, avatarUrl } from "@/components/AvatarPicker";
import { backgroundStyle } from "@/app/leerling/winkel/page";
import {
  STAGES,
  STAGE_LABELS,
  LEVELS_PER_STAGE,
  MAX_LEVEL,
  levelToStage,
  withinStageLevel,

} from "@/lib/math";

const BONUS_COST = 20;

export default function StudentPortal() {
  const router = useRouter();
  const { user, ready, logout, updateStudent } = useAuth();
  const student = user && user.role === "student" ? user : null;

  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState("leerling-jongen-1");
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [playedToday, setPlayedToday] = useState(false);
  const [buyingBonus, setBuyingBonus] = useState(false);
  const [restoringStreak, setRestoringStreak] = useState(false);

  useEffect(() => {
    if (ready && !student) router.replace("/leerling");
  }, [ready, student, router]);

  useEffect(() => {
    if (student && !student.avatarUrl) setPickingAvatar(true);
  }, [student]);

  // Check if already played today
  useEffect(() => {
    if (!student) return;
    const today = new Date().toISOString().slice(0, 10);
    fetch(`/api/leerling/speelde-vandaag?studentId=${student.id}&date=${today}`)
      .then((r) => r.json())
      .then((d) => setPlayedToday(!!d.played));
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

  async function restoreStreak() {
    if (!student) return;
    setRestoringStreak(true);
    const res = await fetch("/api/leerling/herstel-reeks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id }),
    });
    const data = await res.json();
    setRestoringStreak(false);
    if (!res.ok) { alert(data.error || "Mislukt."); return; }
    updateStudent({ coins: data.coins, streak: data.streak, streakLost: 0 });
  }

  async function buyBonus() {
    if (!student) return;
    setBuyingBonus(true);
    const res = await fetch("/api/leerling/koop-bonus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id }),
    });
    const data = await res.json();
    setBuyingBonus(false);
    if (!res.ok) { alert(data.error || "Mislukt."); return; }
    updateStudent({ coins: data.coins });
    router.push("/leerling/oefenen?bonus=1");
  }

  if (!ready || !student) return null;

  const level = student.level ?? 1;
  const stage = levelToStage(level);
  const wl = withinStageLevel(level);
  const stageIndex = STAGES.indexOf(stage);
  const bg = student.background;

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
        <Link href="/" className="text-sm text-dark/50 hover:text-coral">← Home</Link>
        <button onClick={() => { logout(); router.push("/"); }} className="text-sm text-dark/50 hover:text-coral">
          Uitloggen
        </button>
      </div>

      {/* Welkom */}
      <div
        className="flex flex-col items-center gap-4 rounded-3xl p-8 text-center shadow-sm"
        style={bg ? backgroundStyle(bg) : { background: "white" }}
      >
        <button
          onClick={() => setPickingAvatar(true)}
          className="group relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white/30 transition hover:opacity-80"
          title="Verander je figuur"
        >
          {student.avatarUrl ? (
            <Image src={student.avatarUrl} alt="avatar" width={112} height={112} className="h-full w-full object-contain" />
          ) : (
            <span className="text-5xl">🧒</span>
          )}
          <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/30 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">
            Wijzig
          </span>
        </button>
        <div className="rounded-2xl bg-white/70 px-6 py-5 text-center backdrop-blur-sm">
        <h1 className="text-3xl font-extrabold">Hoi {student.nickname}!</h1>

        {student.streakLost > 0 && student.streak <= 1 && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-dark/50">Je reeks van {student.streakLost} dagen is verbroken.</p>
            <button
              onClick={restoreStreak}
              disabled={restoringStreak || student.coins < 20}
              className="flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
            >
              {restoringStreak ? "Bezig..." : <>🔁 Herstel reeks <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">20 munten</span></>}
            </button>
          </div>
        )}

        <p className="mt-2 flex items-center gap-2 rounded-full bg-yellow/20 px-5 py-2 font-mono text-xl font-bold text-dark">
          <Illustration name="coin" size={22} />
          {student.coins} munten
        </p>
        <Link href="/leerling/winkel" className="text-sm text-purple hover:underline">
          🛒 Naar de winkel
        </Link>
        </div>
      </div>

      {/* Level info */}
      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-extrabold">Level {level}{level >= MAX_LEVEL && " 🏆"}</h2>
          <span className="text-sm text-dark/50">{STAGE_LABELS[stage]} — {wl}/20</span>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-cream">
          <div className="h-3 rounded-full bg-purple transition-all" style={{ width: `${((wl - 1) / LEVELS_PER_STAGE) * 100}%` }} />
        </div>
        {student.streak > 0 && (
          <p className="mt-3 text-center text-sm font-semibold text-coral">
            🔥 Jouw reeks: {student.streak} {student.streak === 1 ? "dag" : "dagen"} op rij — houd hem vast!
          </p>
        )}
        {student.streak === 0 && level < MAX_LEVEL && (
          <p className="mt-3 text-center text-sm text-dark/40">
            Oefen elke schooldag om een reeks op te bouwen!
          </p>
        )}
      </div>

      {/* Oefenen / Extra sessie */}
      {!playedToday ? (
        <Link
          href="/leerling/oefenen"
          className="mt-6 flex items-center justify-center gap-3 rounded-3xl bg-coral py-8 text-center text-3xl font-extrabold text-white shadow-lg transition hover:opacity-90"
        >
          Oefenen! <Illustration name="pencil" size={36} />
        </Link>
      ) : (
        <div className="mt-6 flex flex-col gap-3">
          <div className="flex items-center justify-center gap-3 rounded-3xl bg-green/20 py-5 text-center text-lg font-bold text-green">
            ✓ Vandaag al gespeeld!
          </div>
          <button
            onClick={buyBonus}
            disabled={buyingBonus || student.coins < BONUS_COST}
            className="flex flex-col items-center justify-center gap-1 rounded-3xl bg-purple py-5 text-center text-white shadow-lg transition hover:opacity-90 disabled:opacity-40"
          >
            {buyingBonus ? (
              <span className="text-xl font-extrabold">Bezig...</span>
            ) : (
              <>
                <span className="text-xl font-extrabold">Extra sessie!</span>
                <span className="text-sm font-semibold text-white/80">Kost {BONUS_COST} munten · bij 80% goed: dubbele munten ×2</span>
              </>
            )}
          </button>
          {student.coins < BONUS_COST && (
            <p className="text-center text-xs text-dark/40">Je hebt {BONUS_COST - student.coins} munten tekort voor een extra sessie.</p>
          )}
        </div>
      )}

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
                  current ? "bg-purple text-white" : done ? "bg-green/15 text-green" : "bg-cream text-dark/30"
                }`}
              >
                <div className="flex items-center gap-2">
                  {done ? <Illustration name="star" size={20} /> : current ? <Illustration name="pencil" size={20} /> : <Illustration name="lock" size={20} />}
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
