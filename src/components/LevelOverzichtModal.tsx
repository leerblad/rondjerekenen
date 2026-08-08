"use client";

import { useState } from "react";
import { GRADE_STAGES, STAGE_LABELS } from "@/lib/math";

const GRADE_COLOR: Record<number, string> = {
  4: "bg-green/10 text-green border-green/20",
  5: "bg-purple/10 text-purple border-purple/20",
  6: "bg-yellow/20 text-dark border-yellow/30",
  7: "bg-coral/10 text-coral border-coral/20",
  8: "bg-dark/5 text-dark border-dark/10",
};

export function LevelOverzichtKnop() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-full border border-dark/15 bg-white px-5 py-2.5 text-sm font-semibold text-dark/70 shadow-sm transition hover:bg-cream hover:text-dark"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
        Bekijk alle onderdelen per groep
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/60 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-cream text-dark/40 hover:text-dark"
            >
              ✕
            </button>

            <h2 className="text-2xl font-extrabold">Wat oefenen leerlingen?</h2>
            <p className="mt-1 text-sm text-dark/50">
              600 levels verdeeld over groep 4 t/m 8 — elk level bevat 20 sommen.
            </p>

            <div className="mt-6 flex flex-col gap-6">
              {([4, 5, 6, 7, 8] as const).map((grade) => {
                const stages = GRADE_STAGES[grade];
                return (
                  <div key={grade}>
                    <div className={`mb-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-bold ${GRADE_COLOR[grade]}`}>
                      Groep {grade}
                    </div>
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-dark/10 text-left text-xs text-dark/40">
                          <th className="pb-1 font-medium">Blok</th>
                          <th className="pb-1 font-medium">Onderdeel</th>
                          <th className="pb-1 text-right font-medium">Levels</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stages.map((stage, i) => (
                          <tr key={stage} className="border-b border-dark/5 last:border-0">
                            <td className="py-1.5 pr-3 font-mono text-xs text-dark/30">{i + 1}</td>
                            <td className="py-1.5 font-medium">{STAGE_LABELS[stage]}</td>
                            <td className="py-1.5 text-right font-mono text-xs text-dark/40">20</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-center text-xs text-dark/30">
              Leerlingen klimmen automatisch omhoog als ze 95% of meer goed hebben.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
