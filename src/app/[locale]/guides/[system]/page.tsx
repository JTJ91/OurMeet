import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MbtiGuidesPage from "@/features/guides/systems/mbti/GuidesPage";
import { locales, type Locale } from "@/i18n/config";
import { alternatesForPath } from "@/i18n/metadata";

type Props = {
  params: Promise<{ locale: string; system: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, system } = await params;
  return {
    alternates: alternatesForPath(`/guides/${system}`, locale),
  };
}

export default async function LocalizedGuidesSystemPage({ params }: Props) {
  const { locale, system } = await params;
  const t = await getTranslations({ locale, namespace: "guides.system" });
  const activeLocale: Locale = locales.includes(locale as Locale) ? (locale as Locale) : "ko";

  if (system === "mbti") {
    return <MbtiGuidesPage locale={activeLocale} />;
  }

  if (system === "saju") {
    return <div className="mbti-shell py-10 text-sm text-slate-700">{t("sajuComingSoon")}</div>;
  }

  return notFound();
}
