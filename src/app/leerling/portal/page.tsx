"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import Avatar from "@/components/Avatar";
import { Illustration } from "@/components/Illustration";
import {
  OPERATIONS,
  OPERATION_LABELS,
  Operation,
  unlockedOperations,
} from "@/lib/math";

export default function StudentPortal() {
  const router = useRouter();
  const { user, ready, logout } = useAuth();
  const student = user && user.role === "student" ? user : null;

  useEffect(() => {
    if (ready && !student) router.replace("/leerling");
  }, [ready, student, router]);

  if (!ready || !student) return null;

  const unlocked = unlockedOperations(student.currentOperation);

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
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

      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white p-8 text-center shadow-sm">
        <Avatar
          outfit={student.avatarOutfit}
          operation={student.currentOperation}
          size={130}
        />
        <h1 className="text-3xl font-extrabold">Hoi {student.nickname}!</h1>
        <p className="flex items-center gap-2 rounded-full bg-yellow/20 px-4 py-2 font-mono text-lg font-bold text-dark">
          <Illustration name="coin" size={20} />
          {student.coins} munten
        </p>
      </div>

      <Link
        href="/leerling/oefenen"
        className="mt-6 flex items-center justify-center gap-3 rounded-3xl bg-coral py-8 text-center text-3xl font-extrabold text-white shadow-lg transition hover:opacity-90"
      >
        Oefenen!
        <Illustration name="pencil" size={36} />
      </Link>

      <div className="mt-6 rounded-3xl bg-white p-6 shadow-sm">
        <h2 className="mb-3 font-bold">Jouw onderdelen</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {OPERATIONS.map((op: Operation) => {
            const open = unlocked.includes(op);
            const current = op === student.currentOperation;
            return (
              <div
                key={op}
                className={`rounded-2xl p-4 text-center ${
                  current
                    ? "bg-green text-white"
                    : open
                      ? "bg-green/15 text-green"
                      : "bg-cream text-dark/30"
                }`}
              >
                <div className="flex justify-center text-2xl">
                  {open ? (
                    <Illustration name="star" size={26} />
                  ) : (
                    <Illustration name="lock" size={26} />
                  )}
                </div>
                <div className="text-sm font-semibold">
                  {OPERATION_LABELS[op]}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-center text-xs text-dark/40">
          Haal 3 dagen achter elkaar 80% goed om het volgende onderdeel vrij te
          spelen!
        </p>
      </div>

      <Link
        href="/leerling/winkel"
        className="mt-6 flex items-center justify-center gap-2 rounded-3xl border-2 border-purple py-5 text-center text-xl font-bold text-purple transition hover:bg-purple/5"
      >
        <Illustration name="shop" size={28} />
        Naar de winkel
      </Link>
    </main>
  );
}
