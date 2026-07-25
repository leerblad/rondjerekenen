"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth, type StudentUser } from "@/lib/AuthContext";
import { Illustration } from "@/components/Illustration";

type ShopItem = {
  key: string;
  label: string;
  category: "color" | "pattern" | "image";
  price: number;
  preview: React.ReactNode;
};

const COLORS: ShopItem[] = [
  { key: "color-green",  label: "Groen",  category: "color", price: 50, preview: <div className="h-full w-full rounded-xl bg-green" /> },
  { key: "color-red",    label: "Rood",   category: "color", price: 50, preview: <div className="h-full w-full rounded-xl bg-coral" /> },
  { key: "color-blue",   label: "Blauw",  category: "color", price: 50, preview: <div className="h-full w-full rounded-xl bg-blue-400" /> },
  { key: "color-purple", label: "Paars",  category: "color", price: 50, preview: <div className="h-full w-full rounded-xl bg-purple" /> },
  { key: "color-yellow", label: "Geel",   category: "color", price: 50, preview: <div className="h-full w-full rounded-xl bg-yellow" /> },
  { key: "color-pink",   label: "Roze",   category: "color", price: 50, preview: <div className="h-full w-full rounded-xl bg-pink-300" /> },
];

const PATTERNS: ShopItem[] = [
  {
    key: "pattern-stripes", label: "Strepen", category: "pattern", price: 100,
    preview: <div className="h-full w-full rounded-xl" style={{ background: "repeating-linear-gradient(45deg,#a78bfa,#a78bfa 8px,#fff 8px,#fff 16px)" }} />,
  },
  {
    key: "pattern-dots", label: "Bolletjes", category: "pattern", price: 100,
    preview: <div className="h-full w-full rounded-xl" style={{ background: "radial-gradient(circle,#f97066 3px,transparent 3px) 0 0/16px 16px,#fef3c7" }} />,
  },
  {
    key: "pattern-zigzag", label: "Zigzag", category: "pattern", price: 100,
    preview: <div className="h-full w-full rounded-xl" style={{ background: "linear-gradient(135deg,#4ade80 25%,transparent 25%) -10px 0,linear-gradient(225deg,#4ade80 25%,transparent 25%) -10px 0,linear-gradient(315deg,#4ade80 25%,transparent 25%),linear-gradient(45deg,#4ade80 25%,transparent 25%),#fff", backgroundSize: "20px 20px" }} />,
  },
  {
    key: "pattern-stars", label: "Sterren", category: "pattern", price: 100,
    preview: <div className="h-full w-full rounded-xl bg-purple" style={{ backgroundImage: "radial-gradient(circle,#fef08a 2px,transparent 2px)", backgroundSize: "14px 14px" }} />,
  },
];

const IMAGE_FILES = [
  { key: "image-strand",     label: "Strand",     file: "strand_achtergrond.jpg" },
  { key: "image-minecraft",  label: "Minecraft",  file: "minecraft_achtergrond.png" },
  { key: "image-graffiti",   label: "Graffiti",   file: "graffiti_achtergrond.png" },
  { key: "image-meisjes",    label: "Meisjes",    file: "meisjes_achtergrond.png" },
  { key: "image-meisjes2",   label: "Meisjes 2",  file: "meisjes2_achtergrond.png" },
  { key: "image-vuurwerk",   label: "Vuurwerk",   file: "vuurwerk_achtergrond.jpg" },
];

const IMAGES: ShopItem[] = IMAGE_FILES.map(({ key, label, file }) => ({
  key,
  label,
  category: "image" as const,
  price: 150,
  preview: (
    <div className="relative h-full w-full">
      <Image src={`/backgrounds/${file}`} alt={label} fill className="rounded-xl object-cover" />
    </div>
  ),
}));

export function backgroundStyle(bg: string | null | undefined): React.CSSProperties {
  if (!bg) return {};
  if (bg.startsWith("color-")) {
    const map: Record<string, string> = {
      "color-green": "#4ade80",
      "color-red": "#f97066",
      "color-blue": "#60a5fa",
      "color-purple": "#a78bfa",
      "color-yellow": "#fde047",
      "color-pink": "#f9a8d4",
    };
    return { background: map[bg] ?? "#e5e7eb" };
  }
  if (bg === "pattern-stripes") return { background: "repeating-linear-gradient(45deg,#a78bfa,#a78bfa 8px,#fff 8px,#fff 16px)" };
  if (bg === "pattern-dots") return { background: "radial-gradient(circle,#f97066 3px,transparent 3px) 0 0/16px 16px,#fef3c7" };
  if (bg === "pattern-zigzag") return { background: "linear-gradient(135deg,#4ade80 25%,transparent 25%) -10px 0,linear-gradient(225deg,#4ade80 25%,transparent 25%) -10px 0,linear-gradient(315deg,#4ade80 25%,transparent 25%),linear-gradient(45deg,#4ade80 25%,transparent 25%),#fff", backgroundSize: "20px 20px" };
  if (bg === "pattern-stars") return { background: "#a78bfa", backgroundImage: "radial-gradient(circle,#fef08a 2px,transparent 2px)", backgroundSize: "14px 14px" };
  if (bg.startsWith("image-")) {
    const found = IMAGE_FILES.find((f) => f.key === bg);
    if (found) return { backgroundImage: `url(/backgrounds/${found.file})`, backgroundSize: "cover", backgroundPosition: "center" };
  }
  return {};
}

export default function Winkel() {
  const router = useRouter();
  const { user, updateStudent } = useAuth();
  const student = user?.role === "student" ? (user as StudentUser) : null;

  const [buying, setBuying] = useState<string | null>(null);
  const [error, setError] = useState("");

  if (!student) {
    if (typeof window !== "undefined") router.replace("/leerling");
    return null;
  }

  async function buy(item: ShopItem) {
    if (!student) return;
    setError("");
    setBuying(item.key);
    const res = await fetch("/api/leerling/koop", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId: student.id, background: item.key, category: item.category }),
    });
    const data = await res.json();
    setBuying(null);
    if (!res.ok) { setError(data.error || "Mislukt."); return; }
    updateStudent({ coins: data.coins, background: data.background, ownedBackgrounds: data.ownedBackgrounds });
  }

  const currentBg = student.background;
  const ownedBgs: string[] = student.ownedBackgrounds ?? [];

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/leerling/portal" className="text-sm text-dark/50 hover:text-coral">← Terug</Link>
        <p className="flex items-center gap-2 font-mono font-bold">
          <Illustration name="coin" size={18} />
          {student.coins} munten
        </p>
      </div>

      <h1 className="mb-2 text-3xl font-extrabold">Winkel</h1>
      <p className="mb-8 text-sm text-dark/50">Koop een achtergrond voor jouw avatar!</p>

      {error && <p className="mb-4 text-sm text-coral">{error}</p>}

      {[
        { title: "Effen kleuren", subtitle: "50 munten", items: COLORS },
        { title: "Patronen", subtitle: "100 munten", items: PATTERNS },
        { title: "Afbeeldingen", subtitle: "150 munten", items: IMAGES },
      ].map(({ title, subtitle, items }) => (
        <section key={title} className="mb-8">
          <div className="mb-3 flex items-baseline gap-2">
            <h2 className="font-bold">{title}</h2>
            <span className="text-xs text-dark/40">{subtitle}</span>
          </div>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {items.map((item) => {
              const owned = ownedBgs.includes(item.key);
              const active = currentBg === item.key;
              const canAfford = student.coins >= item.price;
              return (
                <button
                  key={item.key}
                  onClick={() => buy(item)}
                  disabled={!!buying}
                  className={`relative flex flex-col items-center gap-1 rounded-2xl border-4 p-1 transition ${
                    active ? "border-purple" : owned ? "border-green" : "border-transparent hover:border-black/10"
                  } ${!canAfford && !owned ? "opacity-40" : ""}`}
                >
                  <div className="relative h-16 w-full overflow-hidden rounded-xl bg-cream">
                    {item.preview}
                  </div>
                  <span className="text-xs font-semibold">{item.label}</span>
                  {owned && (
                    <span className={`absolute -right-1 -top-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white ${active ? "bg-purple" : "bg-green"}`}>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      ))}

      {currentBg && (
        <div className="mt-4 rounded-3xl bg-white p-6 text-center shadow-sm">
          <p className="mb-3 font-bold">Jouw avatar</p>
          <div
            className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl"
            style={backgroundStyle(currentBg)}
          >
            {student.avatarUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={student.avatarUrl} alt="avatar" className="h-full w-full object-contain" />
            )}
          </div>
        </div>
      )}
    </main>
  );
}
