import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { getLocale } from "next-intl/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "moimflow",
  description: "궁합 점수 바로 확인!",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    title: "MoimFlow | 모임의 흐름",
    description: "우리 모임의 관계 흐름과 역할 균형을 한눈에 확인하세요.",
    url: "https://www.moimflow.com/",
    images: [
      {
        url: "https://www.moimflow.com/og.png?v=6",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
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
        {children}
      </body>
    </html>
  );
}
