import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "moimrank",
  description: "관계 랭킹 바로 확인!",
  openGraph: {
    type: "website",
    title: "moimrank - 모임 랭킹",
    description: "우리 모임에서 누가 제일 잘 맞을까?",
    url: "https://www.moimrank.com/",
    images: [
      {
        url: "https://www.moimrank.com/og.png?v=20260210-1",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col bg-[#F5F9FF]">
        {/* 페이지 내용 */}
        <div className="flex-1">
          {children}
        </div>

        {/* 공통 Footer */}
        <footer className="py-10 text-center text-xs text-slate-500 bg-[#F5F9FF] backdrop-blur pb-30">
          <div className="space-x-3">
            <Link href="/guides" className="hover:text-slate-700 transition">
              MBTI 가이드
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/faq" className="hover:text-slate-700 transition">
              자주 묻는 질문
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/terms" className="hover:text-slate-700 transition">
              이용 약관
            </Link>
            <span className="text-slate-300">·</span>
            <Link href="/privacy" className="hover:text-slate-700 transition">
              개인정보처리방침
            </Link>
          </div>

          <div className="mt-4 text-[11px] text-slate-400">
            © 2026 모임랭크. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

