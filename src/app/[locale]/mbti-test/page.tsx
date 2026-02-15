import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import MbtiTestClient from "@/features/mbti/mbti-test/MbtiTestClient";
import { alternatesForPath } from "@/i18n/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

function localeBase(locale: string) {
  return locale === "ko" ? "" : `/${locale}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: alternatesForPath("/mbti-test", locale),
  };
}

export default async function LocalizedMbtiTestPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mbtiTest.page" });
  const base = localeBase(locale);

  return (
    <main className="mbti-page-bg">
      <div className="mbti-shell pb-16 pt-10">
        <div className="mbti-card-frame mb-4 flex items-center justify-between">
          <Link href={`${base}/mbti`} className="mbti-back-btn">
            <span aria-hidden>←</span>
            <span>{t("backToMbti")}</span>
          </Link>
        </div>

        <header className="mbti-card mbti-card-frame p-6">
          <h1 className="text-3xl font-extrabold leading-tight text-slate-900">
            {t("title")}
            <br />
            <span className="underline decoration-[#FDD835]/70 underline-offset-4">{t("subtitle")}</span>
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            <b className="text-[#1E88E5]">{t("descriptionLead")}</b>
            {t("descriptionLeadSuffix")}
            <br />
            {t("descriptionPrefix")} <b className="text-slate-800">{t("descriptionEmphasis")}</b>
            {t("descriptionSuffix")}
          </p>

          <Link
            href={`${base}/mbti/create`}
            className="mt-3 inline-block text-xs font-bold text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700"
          >
            {t("quickLink")}
          </Link>
        </header>

        <section className="mbti-card mbti-card-frame mt-5 p-5">
          <MbtiTestClient locale={locale} />
        </section>

        <div className="mt-6 text-center text-[11px] font-bold text-slate-500">{t("footerNote")}</div>
      </div>
    </main>
  );
}
