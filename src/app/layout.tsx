import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getLocale } from "next-intl/server";
import { headers } from "next/headers";
import "./globals.css";
import Script from "next/script";
import RootChrome from "@/app/components/RootChrome";

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
  description: "궁합 점수 바로 확인!",
  icons: {
    icon: "/favicon.png",
  },
  openGraph: {
    type: "website",
    title: "moimrank - 모임 궁합",
    description: "우리 모임에서 누가 제일 잘 맞을까?",
    url: "https://www.moimrank.com/",
    images: [
      {
        url: "https://www.moimrank.com/og.png?v=5",
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
  const h = await headers();
  const headerLocale = h.get("x-next-intl-locale");
  const locale =
    headerLocale === "ko" || headerLocale === "en" || headerLocale === "ja"
      ? headerLocale
      : await getLocale().catch(() => "ko");

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
        <RootChrome>{children}</RootChrome>
      </body>
    </html>
  );
}
