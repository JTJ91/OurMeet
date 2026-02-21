"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import FloatingToTop from "@/components/FloatingToTop";

export default function ClientOverlays() {
  const pathname = usePathname();
  const hideToTop = useMemo(() => pathname === "/" || /^\/(ko|en|ja)$/.test(pathname || ""), [pathname]);

  useEffect(() => {
    let ctaEl: HTMLElement | null = null;
    const setVar = () => {
      const h = ctaEl ? Math.ceil(ctaEl.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty("--bottom-cta-h", `${h}px`);
    };

    const ro = new ResizeObserver(() => setVar());
    const attach = () => {
      const next = document.querySelector<HTMLElement>("[data-bottom-cta]");
      if (next === ctaEl) return;
      if (ctaEl) ro.unobserve(ctaEl);
      ctaEl = next;
      if (ctaEl) ro.observe(ctaEl);
      setVar();
    };
    const mo = new MutationObserver(() => attach());

    attach();
    window.addEventListener("resize", setVar);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", setVar);
      mo.disconnect();
      ro.disconnect();
    };
  }, []);

  return <>{!hideToTop && <FloatingToTop />}</>;
}
