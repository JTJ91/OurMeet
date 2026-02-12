"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname() || "";

  const system =
    pathname.startsWith("/mbti") || pathname.startsWith("/guides/mbti") || pathname.startsWith("/systems/mbti")
      ? "mbti"
      : pathname.startsWith("/saju") || pathname.startsWith("/guides/saju") || pathname.startsWith("/systems/saju")
      ? "saju"
      : "base";

  return (
    <footer className="bg-[#F5F9FF] pb-30 text-center text-xs text-slate-500">
      {/* 시스템 링크 */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        {system === "mbti" ? (
          <>
            <Link href="/mbti" className="hover:text-slate-700 transition">MBTI 홈</Link>
            <span className="text-slate-300">·</span>
            <Link href="/guides/mbti" className="hover:text-slate-700 transition">모임 속 MBTI</Link>
            <span className="text-slate-300">·</span>
            <Link href="/systems/mbti/cognitive-functions" className="hover:text-slate-700 transition">인지기능</Link>
            <span className="text-slate-300">·</span>
            <Link href="/faq" className="hover:text-slate-700 transition">자주 묻는 질문</Link>
          </>
        ) : system === "saju" ? (
          <>
            <Link href="/saju" className="hover:text-slate-700 transition">사주 홈</Link>
            <span className="text-slate-300">·</span>
            <Link href="/guides/saju" className="hover:text-slate-700 transition">사주 가이드</Link>
            <span className="text-slate-300">·</span>
            <Link href="/faq" className="hover:text-slate-700 transition">자주 묻는 질문</Link>
          </>
        ) : (
          <>
            <Link href="/" className="hover:text-slate-700 transition">홈</Link>
          </>
        )}
      </div>

      {/* 정책 링크 (공통) */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <Link href="/terms" className="hover:text-slate-700 transition">이용 약관</Link>
        <span className="text-slate-300">·</span>
        <Link href="/privacy" className="hover:text-slate-700 transition">개인정보처리방침</Link>
      </div>

      <div className="mt-4 text-[11px] text-slate-400">
        © 2026 모임랭크. All rights reserved.
      </div>
    </footer>
  );
}
