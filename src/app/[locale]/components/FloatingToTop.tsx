"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function FloatingToTop() {
  const [show, setShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const t = useTranslations("components.toTop");

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > 300);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onMenu = (e: Event) => {
      const ce = e as CustomEvent<{ open: boolean }>;
      setMenuOpen(!!ce.detail?.open);
    };

    window.addEventListener("app:menu", onMenu as EventListener);
    return () => window.removeEventListener("app:menu", onMenu as EventListener);
  }, []);

  useEffect(() => {
    const checkCTA = () => {
      const el = document.querySelector("[data-bottom-cta]");
      if (!el) {
        setCtaVisible(false);
        return;
      }
      const rect = (el as HTMLElement).getBoundingClientRect();
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

  if (!show || menuOpen || ctaVisible) return null;

  return (
    <button
      type="button"
      aria-label={t("ariaLabel")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-4 z-[55] rounded-full border border-slate-200/70 bg-white/92 px-4 py-3 text-xs font-extrabold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.14)] backdrop-blur-sm hover:bg-white active:scale-[0.98]"
      style={{ bottom: "calc(var(--bottom-cta-h, 0px) + 16px + env(safe-area-inset-bottom))" }}
    >
      {t("label")}
    </button>
  );
}
