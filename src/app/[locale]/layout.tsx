import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";
import ClientOverlays from "@/components/ClientOverlays";
import LayoutChrome from "@/components/LayoutChrome";
import { getScopedMessages } from "@/i18n/scoped-messages";

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
  const layoutMessages = await getScopedMessages(locale, [
    "components.header",
    "components.headerDrawer",
    "components.footer",
    "components.toTop",
  ]);

  return (
    <NextIntlClientProvider messages={layoutMessages}>
      <LayoutChrome>
        <div lang={locale} className="flex-1">
          {children}
        </div>
      </LayoutChrome>

      <ClientOverlays />
    </NextIntlClientProvider>
  );
}
