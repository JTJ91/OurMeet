"use client";

import { useEffect, useMemo } from "react";
import { usePathname } from "next/navigation";
import FloatingToTop from "@/app/[locale]/components/FloatingToTop";

export default function ClientOverlays() {
  const pathname = usePathname();
  const hideToTop = useMemo(() => pathname === "/", [pathname]);

  useEffect(() => {
    const setVar = () => {
      const el = document.querySelector<HTMLElement>("[data-bottom-cta]");
      const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty("--bottom-cta-h", `${h}px`);
    };

    setVar();
    window.addEventListener("resize", setVar);

    const ro = new ResizeObserver(setVar);
    const el = document.querySelector<HTMLElement>("[data-bottom-cta]");
    if (el) ro.observe(el);

    return () => {
      window.removeEventListener("resize", setVar);
      ro.disconnect();
    };
  }, [pathname]);

  return <>{!hideToTop && <FloatingToTop />}</>;
}
