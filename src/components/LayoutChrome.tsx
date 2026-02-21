"use client";

import { useSearchParams } from "next/navigation";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";

export default function LayoutChrome({ children }: { children: React.ReactNode }) {
  const sp = useSearchParams();
  const isPreview = sp.get("preview") === "1";

  if (isPreview) {
    // ✅ preview에서는 헤더/푸터 없이 본문만
    return <>{children}</>;
  }

  // ✅ 정상 순서: 헤더 -> 본문 -> 푸터
  return (
    <>
      <AppHeader />
      {children}
      <Footer />
    </>
  );
}
