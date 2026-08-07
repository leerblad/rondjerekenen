"use client";

import { Operation } from "@/lib/math";

const OPERATIONS: Operation[] = ["plus", "min", "keer", "deel", "pct"];
import RPMAvatar from "./RPMAvatar";

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
const SHIRT_COLOR: Record<string, string> = {
  shirt_yellow: "#F5C842",
  shirt_stripe: "#8B7FC7",
  shirt_cape: "#E8705A",
};

// avatar grows / changes colour as the student unlocks operations
const LEVEL_RING = ["#3AB54A", "#F5C842", "#8B7FC7", "#E8705A"];

const SKIN = "#FDDCB5";
const DARK = "#1A1A1A";

export default function Avatar({
  outfit = {},
  operation = "plus",
  size = 120,
  avatarUrl,
}: {
  outfit?: Record<string, string>;
  operation?: string;
  size?: number;
  avatarUrl?: string;
}) {
  if (avatarUrl) {
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <RPMAvatar avatarUrl={avatarUrl} size={size} />
        {/* level badge */}
        <div className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-dark font-mono text-xs font-bold text-white">
          {Math.max(0, ["plus", "min", "keer", "deel"].indexOf(operation)) + 1}
        </div>
      </div>
    );
  }

  const level = Math.max(0, OPERATIONS.indexOf(operation as Operation));
  const ring = LEVEL_RING[Math.min(level, LEVEL_RING.length - 1)];
  const shirtKey = outfit.shirt;
  const shirtColor = SHIRT_COLOR[shirtKey] || "#8B7FC7";
  const isStripe = shirtKey === "shirt_stripe";
  const isCape = shirtKey === "shirt_cape";
  const hatSrc = HAT_SRC[outfit.hat];
  const accSrc = ACC_SRC[outfit.accessory];
  const ringWidth = 4 + level;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label="Avatar"
      style={{ filter: "drop-shadow(0 6px 0 rgba(0,0,0,0.08))" }}
    >
      <defs>
        {isStripe && (
          <pattern
            id="stripe"
            width="10"
            height="10"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(0)"
          >
            <rect width="10" height="10" fill="#FAF6F0" />
            <rect width="5" height="10" fill="#8B7FC7" />
          </pattern>
        )}
        <clipPath id="circleClip">
          <circle cx="50" cy="50" r="48" />
        </clipPath>
      </defs>

      {/* background circle */}
      <circle cx="50" cy="50" r="48" fill="#FAF6F0" />

      <g clipPath="url(#circleClip)">
        {/* cape behind body */}
        {isCape && (
          <path
            d="M28 100 Q20 70 26 60 H74 Q80 70 72 100 Z"
            fill="#E8705A"
          />
        )}

        {/* body / shirt */}
        <path
          d="M30 100 V78 a20 20 0 0 1 40 0 V100 Z"
          fill={isStripe ? "url(#stripe)" : shirtColor}
          stroke={DARK}
          strokeWidth="1.5"
        />

        {/* neck */}
        <rect x="44" y="56" width="12" height="12" rx="3" fill={SKIN} />

        {/* hair behind head */}
        <path
          d="M28 44 a22 22 0 0 1 44 0 V46 H28 Z"
          fill={DARK}
        />

        {/* head */}
        <circle cx="50" cy="44" r="20" fill={SKIN} stroke={DARK} strokeWidth="1.5" />

        {/* hair fringe on top */}
        <path
          d="M30 42 a20 20 0 0 1 40 0 q-6 -6 -12 -3 q-4 -5 -10 -2 q-6 -2 -10 4 Z"
          fill={DARK}
        />

        {/* eyes */}
        <circle cx="43" cy="44" r="2.4" fill={DARK} />
        <circle cx="57" cy="44" r="2.4" fill={DARK} />

        {/* smile */}
        <path
          d="M43 52 q7 6 14 0"
          fill="none"
          stroke={DARK}
          strokeWidth="2"
          strokeLinecap="round"
        />

        {/* accessory (worn around face / neck) */}
        {accSrc && (
          <image
            href={accSrc}
            x="30"
            y={outfit.accessory === "acc_sunglasses" ? 36 : 56}
            width="40"
            height="40"
          />
        )}

        {/* hat above head */}
        {hatSrc && (
          <image href={hatSrc} x="26" y="6" width="48" height="48" />
        )}
      </g>

      {/* level ring */}
      <circle
        cx="50"
        cy="50"
        r={48 - ringWidth / 2}
        fill="none"
        stroke={ring}
        strokeWidth={ringWidth}
      />

      {/* level badge */}
      <g>
        <circle cx="82" cy="82" r="14" fill={ring} stroke="#FFFFFF" strokeWidth="2" />
        <text
          x="82"
          y="83"
          textAnchor="middle"
          dominantBaseline="central"
          fontFamily="monospace"
          fontSize="14"
          fontWeight="bold"
          fill="#FFFFFF"
        >
          {level + 1}
        </text>
      </g>
    </svg>
  );
}
