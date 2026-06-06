"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/lib/AuthContext";
import { Illustration } from "@/components/Illustration";
import { Operation, OPERATIONS } from "@/lib/math";

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

const HAT_SRC: Record<string, string> = {
  hat_red: "/illustrations/hat-red.svg",
  hat_blue: "/illustrations/hat-blue.svg",
  hat_wizard: "/illustrations/hat-wizard.svg",
};
const ACC_SRC: Record<string, string> = {
  acc_sunglasses: "/illustrations/sunglasses.svg",
  acc_bowtie: "/illustrations/bowtie.svg",
  acc_chain: "/illustrations/chain.svg",
};
const ASSET_SRC: Record<string, string> = {
  ...HAT_SRC,
  ...ACC_SRC,
  shirt_yellow: "/illustrations/shirt-yellow.svg",
  shirt_stripe: "/illustrations/shirt-stripe.svg",
  shirt_cape: "/illustrations/shirt-cape.svg",
};

const SHIRT_COLOR: Record<string, string> = {
  shirt_yellow: "#F5C842",
  shirt_stripe: "#8B7FC7",
  shirt_cape: "#E8705A",
};

const LEVEL_RING = ["#3AB54A", "#F5C842", "#8B7FC7", "#E8705A"];
const SKIN = "#FDDCB5";
const DARK = "#1A1A1A";

function DressUpCharacter({
  outfit = {},
  operation = "plus",
  width = 200,
  height = 320,
}: {
  outfit?: Record<string, string>;
  operation?: string;
  width?: number;
  height?: number;
}) {
  const level = Math.max(0, OPERATIONS.indexOf(operation as Operation));
  const ring = LEVEL_RING[Math.min(level, LEVEL_RING.length - 1)];
  const shirtKey = outfit.shirt;
  const shirtColor = SHIRT_COLOR[shirtKey] || "#8B7FC7";
  const isStripe = shirtKey === "shirt_stripe";
  const isCape = shirtKey === "shirt_cape";
  const hatSrc = HAT_SRC[outfit.hat];
  const accSrc = ACC_SRC[outfit.accessory];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 160"
      role="img"
      aria-label="Avatar"
      style={{ filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.08))" }}
    >
      <defs>
        {isStripe && (
          <pattern
            id="dress-stripe"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
          >
            <rect width="10" height="10" fill="#FAF6F0" />
            <rect width="5" height="10" fill="#8B7FC7" />
          </pattern>
        )}
      </defs>

      {/* operation ring around the whole figure */}
      <ellipse
        cx="50"
        cy="80"
        rx="46"
        ry="76"
        fill="none"
        stroke={ring}
        strokeWidth={4 + level}
      />

      {/* cape behind body */}
      {isCape && (
        <path d="M30 60 Q12 100 22 140 H78 Q88 100 70 60 Z" fill="#E8705A" />
      )}

      {/* legs */}
      <rect x="38" y="118" width="10" height="34" rx="4" fill={DARK} />
      <rect x="52" y="118" width="10" height="34" rx="4" fill={DARK} />

      {/* arms */}
      <rect x="20" y="74" width="9" height="40" rx="4.5" fill={shirtColor} stroke={DARK} strokeWidth="1.5" />
      <rect x="71" y="74" width="9" height="40" rx="4.5" fill={shirtColor} stroke={DARK} strokeWidth="1.5" />

      {/* torso / shirt */}
      <rect
        x="30"
        y="70"
        width="40"
        height="52"
        rx="8"
        fill={isStripe ? "url(#dress-stripe)" : shirtColor}
        stroke={DARK}
        strokeWidth="1.5"
      />

      {/* neck */}
      <rect x="44" y="60" width="12" height="14" rx="3" fill={SKIN} />

      {/* hair behind head */}
      <circle cx="50" cy="38" r="22" fill={DARK} />

      {/* head */}
      <circle cx="50" cy="40" r="20" fill={SKIN} stroke={DARK} strokeWidth="1.5" />

      {/* hair fringe */}
      <path
        d="M30 38 a20 20 0 0 1 40 0 q-6 -6 -12 -3 q-4 -5 -10 -2 q-6 -2 -10 4 Z"
        fill={DARK}
      />

      {/* eyes */}
      <circle cx="43" cy="40" r="2.4" fill={DARK} />
      <circle cx="57" cy="40" r="2.4" fill={DARK} />

      {/* smile */}
      <path
        d="M43 48 q7 6 14 0"
        fill="none"
        stroke={DARK}
        strokeWidth="2"
        strokeLinecap="round"
      />

      {/* accessory on face / chest */}
      {accSrc && (
        <image
          href={accSrc}
          x="30"
          y={outfit.accessory === "acc_sunglasses" ? 32 : 78}
          width="40"
          height="40"
        />
      )}

      {/* hat above head */}
      {hatSrc && <image href={hatSrc} x="26" y={-2} width="48" height="48" />}
    </svg>
  );
}

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
    <main className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/leerling/portal"
          className="text-sm text-dark/50 hover:text-coral"
        >
          ← Terug
        </Link>
        <span className="flex items-center gap-2 rounded-full bg-yellow/20 px-4 py-2 font-mono font-bold">
          {coins}
          <Illustration name="coin" size={18} />
        </span>
      </div>

      <h1 className="flex items-center gap-2 text-3xl font-extrabold">
        <Illustration name="shop" size={32} />
        Winkel
      </h1>
      {error && <p className="mt-2 text-sm text-coral">{error}</p>}

      <div className="mt-6 flex flex-col gap-8 md:flex-row md:items-start">
        {/* Dress-up character */}
        <div className="flex flex-col items-center gap-3 rounded-3xl bg-white p-6 shadow-sm md:sticky md:top-6 md:w-72 md:shrink-0">
          <DressUpCharacter
            outfit={equipped}
            operation={student.currentOperation}
            width={200}
            height={320}
          />
          <p className="text-sm text-dark/50">Jouw avatar</p>
        </div>

        {/* Item cards */}
        <div className="flex-1">
          {categories.map((cat) => (
            <section key={cat} className="mb-8">
              <h2 className="mb-3 font-bold">{CATEGORY_LABELS[cat] || cat}</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {items
                  .filter((i) => i.category === cat)
                  .map((item) => {
                    const isOwned = owned.includes(item.id);
                    const isEquipped =
                      equipped[item.category] === item.asset_key;
                    const canAfford = coins >= item.cost;
                    const src = ASSET_SRC[item.asset_key];
                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col items-center gap-2 rounded-2xl border-2 p-4 text-center ${
                          isEquipped
                            ? "border-green bg-green/5"
                            : "border-transparent bg-white"
                        } shadow-sm`}
                      >
                        {src && (
                          <Image
                            src={src}
                            alt={item.name}
                            width={56}
                            height={56}
                            className="h-14 w-14 object-contain"
                          />
                        )}
                        <p className="font-semibold">{item.name}</p>
                        {!isOwned && (
                          <p className="flex items-center justify-center gap-1 font-mono text-sm text-dark/60">
                            {item.cost}
                            <Illustration name="coin" size={16} />
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
        </div>
      </div>
    </main>
  );
}
