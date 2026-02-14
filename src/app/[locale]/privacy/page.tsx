import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { alternatesForPath } from "@/i18n/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: alternatesForPath("/privacy", locale),
  };
}

export default async function LocalizedPrivacyPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy.page" });
  const base = locale === "ko" ? "" : `/${locale}`;

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mbti-shell pb-16 pt-10">
        <div className="mbti-card-frame mb-4 flex items-center justify-between">
          <Link href={`${base}/mbti`} className="mbti-back-btn">
            <span aria-hidden>←</span>
            <span>{t("back")}</span>
          </Link>
        </div>

        <header className="mbti-card-frame rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-700">{t("intro")}</p>
          <p className="mt-3 text-xs font-semibold text-slate-600">
            {t("effectiveDateLabel")}: {t("effectiveDate")}
          </p>
        </header>

        <section className="mt-8 space-y-4">
          <Card title={t("section1Title")} body={t("section1Body")} />
          <Card title={t("section2Title")} body={t("section2Body")} />
          <Card title={t("section3Title")} body={t("section3Body")} />
          <div className="mbti-card mbti-card-frame p-5">
            <h2 className="text-base font-extrabold text-slate-900">{t("contactLabel")}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-700">{t("contact")}</p>
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="mbti-card mbti-card-frame p-5">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
    </div>
  );
}
