"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function FloatingToTop() {
  const [show, setShow] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [ctaVisible, setCtaVisible] = useState(false);
  const t = useTranslations("components.toTop");

  useEffect(() => {
    let rafId = 0;

    const update = () => {
      rafId = 0;
      const next = window.scrollY > 300;
      setShow((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScroll);
    };
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
    let observedEl: Element | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const next = !!entry?.isIntersecting;
        setCtaVisible((prev) => (prev === next ? prev : next));
      },
      { threshold: 0.01 }
    );

    const bindTarget = () => {
      const el = document.querySelector("[data-bottom-cta]");
      if (el === observedEl) return;
      if (observedEl) io.unobserve(observedEl);
      observedEl = el;
      if (observedEl) {
        io.observe(observedEl);
      } else {
        setCtaVisible(false);
      }
    };

    bindTarget();

    const mo = new MutationObserver(bindTarget);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
    };
  }, []);

  if (!show || menuOpen || ctaVisible) return null;

  return (
    <button
      type="button"
      aria-label={t("ariaLabel")}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed right-4 z-[55] rounded-full border border-slate-200/70 bg-white/92 px-4 py-3 text-xs font-extrabold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.14)] hover:bg-white active:scale-[0.98]"
      style={{ bottom: "calc(var(--bottom-cta-h, 0px) + 16px + env(safe-area-inset-bottom))" }}
    >
      {t("label")}
    </button>
  );
}
