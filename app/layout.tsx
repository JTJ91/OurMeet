import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

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
        url: "https://www.moimrank.com/og.png",
        width: 1200,
        height: 630,
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
