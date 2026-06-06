"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import Avatar from "@/components/Avatar";

type Item = {
  id: string;
  name: string;
  category: string;
  cost: number;
  asset_key: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  hat: "Hoeden",
  shirt: "Shirts",
  accessory: "Accessoires",
};

export default function Winkel() {
  const router = useRouter();
  const { user, ready, updateStudent } = useAuth();
  const student = user && user.role === "student" ? user : null;

  const [items, setItems] = useState<Item[]>([]);
  const [owned, setOwned] = useState<string[]>([]);
  const [coins, setCoins] = useState(0);
  const [equipped, setEquipped] = useState<Record<string, string>>({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && !student) router.replace("/leerling");
  }, [ready, student, router]);

  const load = useCallback(async (id: string) => {
    const res = await fetch(`/api/shop?studentId=${id}`);
    const data = await res.json();
    setItems(data.items);
    setOwned(data.owned);
    setCoins(data.coins);
    setEquipped(data.equipped || {});
  }, []);

  useEffect(() => {
    if (student) load(student.id);
  }, [student, load]);

  async function act(item: Item) {
    if (!student) return;
    setError("");
    const res = await fetch("/api/shop/buy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, itemId: item.id }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Aankoop mislukt.");
      return;
    }
    setCoins(data.coins);
    setEquipped(data.equipped);
    if (!owned.includes(item.id)) setOwned((o) => [...o, item.id]);
    updateStudent({ coins: data.coins, avatarOutfit: data.equipped });
  }

  if (!ready || !student) return null;

  const categories = Array.from(new Set(items.map((i) => i.category)));

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/leerling/portal"
          className="text-sm text-dark/50 hover:text-coral"
        >
          ← Terug
        </Link>
        <span className="rounded-full bg-yellow/20 px-4 py-2 font-mono font-bold">
          {coins} 🪙
        </span>
      </div>

      <div className="mb-8 flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-sm">
        <Avatar
          outfit={equipped}
          operation={student.currentOperation}
          size={120}
        />
        <p className="text-sm text-dark/50">Jouw avatar</p>
      </div>

      <h1 className="text-3xl font-extrabold">Winkel 🛍️</h1>
      {error && <p className="mt-2 text-sm text-coral">{error}</p>}

      {categories.map((cat) => (
        <section key={cat} className="mt-8">
          <h2 className="mb-3 font-bold">{CATEGORY_LABELS[cat] || cat}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {items
              .filter((i) => i.category === cat)
              .map((item) => {
                const isOwned = owned.includes(item.id);
                const isEquipped = equipped[item.category] === item.asset_key;
                const canAfford = coins >= item.cost;
                return (
                  <div
                    key={item.id}
                    className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center ${
                      isEquipped
                        ? "border-green bg-green/5"
                        : "border-transparent bg-white"
                    } shadow-sm`}
                  >
                    <p className="font-semibold">{item.name}</p>
                    {!isOwned && (
                      <p className="font-mono text-sm text-dark/60">
                        {item.cost} 🪙
                      </p>
                    )}
                    <button
                      onClick={() => act(item)}
                      disabled={!isOwned && !canAfford}
                      className={`mt-1 w-full rounded-full px-3 py-2 text-sm font-semibold transition disabled:opacity-40 ${
                        isEquipped
                          ? "bg-green text-white"
                          : isOwned
                            ? "border-2 border-purple text-purple"
                            : "bg-purple text-white"
                      }`}
                    >
                      {isEquipped
                        ? "Gedragen"
                        : isOwned
                          ? "Aandoen"
                          : canAfford
                            ? "Koop"
                            : "Te duur"}
                    </button>
                  </div>
                );
              })}
          </div>
        </section>
      ))}
    </main>
  );
}
