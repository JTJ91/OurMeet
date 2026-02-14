"use client";

import { NextIntlClientProvider } from "next-intl";
import { usePathname } from "next/navigation";
import AppHeader from "@/app/components/AppHeader";
import Footer from "@/app/components/Footer";
import ClientOverlays from "@/app/components/ClientOverlays";
import LocalizedAppHeader from "@/app/[locale]/components/AppHeader";
import LocalizedFooter from "@/app/[locale]/components/Footer";
import LocalizedClientOverlays from "@/app/[locale]/components/ClientOverlays";
import enMessages from "../../../messages/en.json";
import jaMessages from "../../../messages/ja.json";

type Props = {
  children: React.ReactNode;
};

function detectLocale(pathname: string): "ko" | "en" | "ja" {
  const m = pathname.match(/^\/(ko|en|ja)(?=\/|$)/);
  return (m?.[1] as "ko" | "en" | "ja") ?? "ko";
}

export default function RootChrome({ children }: Props) {
  const pathname = usePathname() || "/";
  const locale = detectLocale(pathname);
  const isLocalized = locale === "en" || locale === "ja";

  if (!isLocalized) {
    return (
      <>
        <AppHeader />
        <div className="flex-1">{children}</div>
        <Footer />
        <ClientOverlays />
      </>
    );
  }

  const messages = locale === "en" ? enMessages : jaMessages;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocalizedAppHeader />
      <div className="flex-1">{children}</div>
      <LocalizedFooter />
      <LocalizedClientOverlays />
    </NextIntlClientProvider>
  );
}
