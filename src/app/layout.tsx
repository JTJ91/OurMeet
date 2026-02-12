import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import Script from "next/script";
import FloatingToTop from "@/app/components/FloatingToTop";
import ClientOverlays from "@/app/components/ClientOverlays";
import AppHeader from "@/app/components/AppHeader";
import Footer from "./components/Footer";

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
        url: "https://www.moimrank.com/og_20260210.png",
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
      <head>
        {/* ✅ Google Analytics (GA4) */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-PPW94SF44D"
          strategy="afterInteractive"
        />
        <Script id="ga-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-PP9W49F44D');
          `}
        </Script>
      </head>

      <body className="min-h-screen flex flex-col bg-[#F5F9FF]">
        <AppHeader />
        
        {/* 페이지 내용 */}
        <div className="flex-1">
          {children}
        </div>

        <Footer />   {/* 기본(홈/공통) */}

        <ClientOverlays />
      </body>
    </html>
  );
}

