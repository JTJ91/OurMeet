import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import AppHeader from "@/app/[locale]/components/AppHeader";
import Footer from "@/app/[locale]/components/Footer";
import ClientOverlays from "@/app/[locale]/components/ClientOverlays";

type Props = {
  children: React.ReactNode;
  params?: Promise<{ locale?: string }>;
};

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
