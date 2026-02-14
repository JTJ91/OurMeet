import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import MbtiGuidesPage from "@/app/guides/_systems/mbti/GuidesPage";
import { locales, type Locale } from "@/i18n/config";

type Props = {
  params: Promise<{ locale: string; system: string }>;
};

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
