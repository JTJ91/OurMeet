import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import AppHeader from "@/components/AppHeader";
import Footer from "@/components/Footer";
import ClientOverlays from "@/components/ClientOverlays";

type Props = {
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: Props) {
  const locale = (await params)?.locale;

  if (!locale || !hasLocale(locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <NextIntlClientProvider>
      <AppHeader />
      <div lang={locale} className="flex-1">
        {children}
      </div>
      <Footer />
      <ClientOverlays />
    </NextIntlClientProvider>
  );
}
