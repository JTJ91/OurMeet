import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import HomePageIntlClient from "./HomePageIntlClient";
import { locales, type Locale } from "@/i18n/config";
import { canonicalForPath, hreflangForPath } from "@/i18n/seo";

type Props = {
  params: Promise<{ locale: string }>;
};

function normalizeLocale(locale: string): Locale {
  return locales.includes(locale as Locale) ? (locale as Locale) : "ko";
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const activeLocale = normalizeLocale(locale);
  const t = await getTranslations({ locale: activeLocale, namespace: "home" });
  const homeHreflang = hreflangForPath("/");

  return {
    title: t("title"),
    description: t("description"),
    alternates: {
      canonical: canonicalForPath("/", activeLocale),
      languages: homeHreflang.languages,
    },
  };
}

export default async function LocalizedHomePage({ params }: Props) {
  const { locale } = await params;
  return <HomePageIntlClient locale={locale} />;
}
