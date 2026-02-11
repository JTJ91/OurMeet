"use client";

import { useEffect, useState } from "react";

export default function FloatingToTop() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 300);
    };
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;

  return (
    <button
      type="button"
      aria-label="맨위로"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-4 z-[55] rounded-full bg-white/90 px-4 py-3 text-xs font-extrabold text-slate-800 shadow-lg ring-1 ring-black/10 backdrop-blur hover:bg-white active:scale-[0.98]"
      style={{
        // ✅ CTA 높이만큼 위로 띄우고, iOS safe-area도 반영
        bottom: "calc(var(--bottom-cta-h, 0px) + 16px + env(safe-area-inset-bottom))",
      }}
    >
      ↑ 맨위로
    </button>
  );
}
