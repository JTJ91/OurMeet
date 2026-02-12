"use client";

import { useEffect, useState } from "react";

export default function FloatingToTop() {
  const [show, setShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);

  // 스크롤 감지
  useEffect(() => {
    const onScroll = () => {
      setShow(window.scrollY > 300);
    };
    onScroll();

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 네비게이션 메뉴 감지
  useEffect(() => {
    const onMenu = (e: Event) => {
      const ce = e as CustomEvent<{ open: boolean }>;
      setMenuOpen(!!ce.detail?.open);
    };

    window.addEventListener("app:menu", onMenu as EventListener);
    return () => window.removeEventListener("app:menu", onMenu as EventListener);
  }, []);

  // ✅ BottomCTA 존재 감지
  useEffect(() => {
    const checkCTA = () => {
      const el = document.querySelector("[data-bottom-cta]");
      if (!el) {
        setCtaVisible(false);
        return;
      }

      const rect = el.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < window.innerHeight;
      setCtaVisible(visible);
    };

    checkCTA();
    window.addEventListener("scroll", checkCTA);
    window.addEventListener("resize", checkCTA);

    return () => {
      window.removeEventListener("scroll", checkCTA);
      window.removeEventListener("resize", checkCTA);
    };
  }, []);

  // 하나라도 열려있으면 숨김
  if (!show || menuOpen || ctaVisible) return null;

  return (
    <button
      type="button"
      aria-label="맨위로"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-4 z-[55] rounded-full bg-white/90 px-4 py-3 text-xs font-extrabold text-slate-800 shadow-lg ring-1 ring-black/10 backdrop-blur hover:bg-white active:scale-[0.98]"
      style={{
        bottom:
          "calc(var(--bottom-cta-h, 0px) + 16px + env(safe-area-inset-bottom))",
      }}
    >
      ↑ 맨위로
    </button>
  );
}
