"use client";

import { useEffect, useState } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cookie-ok")) setVisible(true);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-2xl bg-dark/90 px-5 py-3 text-sm text-white shadow-lg backdrop-blur-sm">
      <span className="text-white/70">
        We gebruiken cookies voor analytics.
      </span>
      <button
        onClick={() => { localStorage.setItem("cookie-ok", "1"); setVisible(false); }}
        className="rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold transition hover:bg-white/30"
      >
        Oké
      </button>
    </div>
  );
}
