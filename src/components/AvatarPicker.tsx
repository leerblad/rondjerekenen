"use client";

import Image from "next/image";

export const STUDENT_AVATARS = [
  { key: "leerling-jongen-1", label: "Jongen 1", ext: "png" },
  { key: "leerling-jongen-2", label: "Jongen 2", ext: "png" },
  { key: "leerling-meisje-1", label: "Meisje 1", ext: "png" },
  { key: "leerling-meisje-2", label: "Meisje 2", ext: "png" },
];

export const TEACHER_AVATARS = [
  { key: "leerkracht-man-boek", label: "Man met boek", ext: "webp" },
  { key: "leerkracht-man-aarde", label: "Man met aardbol", ext: "png" },
  { key: "leerkracht-man-liniaal", label: "Man met liniaal", ext: "png" },
  { key: "leerkracht-vrouw-pen", label: "Vrouw met pen", ext: "png" },
  { key: "leerkracht-vrouw-appel", label: "Vrouw met appel", ext: "png" },
  { key: "leerkracht-vrouw-passer", label: "Vrouw met passer", ext: "png" },
];

export function avatarUrl(key: string, ext: string) {
  return `/avatars/${key}.${ext}`;
}

type Props = {
  avatars: typeof STUDENT_AVATARS;
  selected: string;
  onChange: (key: string) => void;
  cols?: number;
  activeColor?: "purple" | "coral";
};

export function AvatarPicker({ avatars, selected, onChange, cols = 4, activeColor = "purple" }: Props) {
  return (
    <div className={`grid gap-3`} style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
      {avatars.map((a) => (
        <button
          key={a.key}
          type="button"
          onClick={() => onChange(a.key)}
          className={`flex flex-col items-center rounded-2xl border-4 bg-white p-2 transition ${
            selected === a.key
              ? activeColor === "coral"
                ? "border-coral"
                : "border-purple"
              : "border-transparent hover:border-black/10"
          }`}
        >
          <Image
            src={avatarUrl(a.key, a.ext)}
            alt={a.label}
            width={80}
            height={80}
            className="h-20 w-20 object-contain"
          />
        </button>
      ))}
    </div>
  );
}
