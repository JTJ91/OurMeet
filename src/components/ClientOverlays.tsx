"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import FloatingToTop from "@/components/FloatingToTop";

export default function ClientOverlays() {
  const pathname = usePathname();

  // ✅ 메인에서는 안 나오게
  const hideToTop = useMemo(() => pathname === "/", [pathname]);

  // ✅ BottomCTA 높이를 CSS 변수로 계속 갱신
  useEffect(() => {
    const setVar = () => {
      const el = document.querySelector<HTMLElement>("[data-bottom-cta]");
      const h = el ? Math.ceil(el.getBoundingClientRect().height) : 0;
      document.documentElement.style.setProperty("--bottom-cta-h", `${h}px`);
    };

    setVar();

    // resize/route 전환 후 레이아웃 변동 대응
    window.addEventListener("resize", setVar);
    const ro = new ResizeObserver(setVar);

    const el = document.querySelector<HTMLElement>("[data-bottom-cta]");
    if (el) ro.observe(el);

    return () => {
      window.removeEventListener("resize", setVar);
      ro.disconnect();
    };
  }, [pathname]); // ✅ 페이지 이동할 때마다 다시 계산

  return (
    <>
      {!hideToTop && <FloatingToTop />}
    </>
  );
}
