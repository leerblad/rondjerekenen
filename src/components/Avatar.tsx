"use client";

import { Operation, OPERATIONS } from "@/lib/math";

const HAT_EMOJI: Record<string, string> = {
  hat_red: "🧢",
  hat_blue: "🎩",
  hat_wizard: "🧙",
};
const ACC_EMOJI: Record<string, string> = {
  acc_sunglasses: "🕶️",
  acc_bowtie: "🎀",
  acc_chain: "📿",
};
const SHIRT_COLOR: Record<string, string> = {
  shirt_yellow: "#F5C842",
  shirt_stripe: "#8B7FC7",
  shirt_cape: "#E8705A",
};

// avatar grows / changes colour as the student unlocks operations
const LEVEL_RING = ["#3AB54A", "#F5C842", "#8B7FC7", "#E8705A"];

export default function Avatar({
  outfit = {},
  operation = "plus",
  size = 120,
}: {
  outfit?: Record<string, string>;
  operation?: string;
  size?: number;
}) {
  const level = Math.max(0, OPERATIONS.indexOf(operation as Operation));
  const ring = LEVEL_RING[Math.min(level, LEVEL_RING.length - 1)];
  const shirt = SHIRT_COLOR[outfit.shirt] || "#FAF6F0";
  const hat = HAT_EMOJI[outfit.hat];
  const acc = ACC_EMOJI[outfit.accessory];

  return (
    <div
      className="relative flex items-center justify-center rounded-full"
      style={{
        width: size,
        height: size,
        background: shirt,
        border: `${4 + level}px solid ${ring}`,
        boxShadow: "0 6px 0 rgba(0,0,0,0.08)",
      }}
    >
      <span style={{ fontSize: size * 0.5 }}>🙂</span>
      {hat && (
        <span
          className="absolute"
          style={{ top: -size * 0.18, fontSize: size * 0.35 }}
        >
          {hat}
        </span>
      )}
      {acc && (
        <span
          className="absolute"
          style={{ bottom: size * 0.18, fontSize: size * 0.22 }}
        >
          {acc}
        </span>
      )}
      <span
        className="absolute -bottom-2 -right-2 flex h-7 w-7 items-center justify-center rounded-full bg-dark font-mono text-xs font-bold text-white"
        style={{ background: ring }}
        title="Niveau"
      >
        {level + 1}
      </span>
    </div>
  );
}
