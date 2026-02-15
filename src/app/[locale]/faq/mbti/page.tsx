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
    alternates: alternatesForPath("/faq/mbti", locale),
  };
}

export default async function LocalizedFaqMbtiPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq.mbti.page" });
  const base = locale === "ko" ? "" : `/${locale}`;

  return (
    <main className="mbti-page-bg">
      <div className="mbti-shell w-full max-w-3xl pb-16 pt-10">
        <div className="mbti-card-frame mb-4 flex items-center justify-between">
          <Link href={`${base}/mbti`} className="mbti-back-btn">
            <span aria-hidden>←</span>
            <span>{t("back")}</span>
          </Link>
        </div>

        <header className="mbti-card mbti-card-frame p-6">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-700">{t("intro1")}</p>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            {t("intro2Prefix")}{" "}
            <span className="font-semibold text-[#1E88E5]">{t("intro2Highlight")}</span>{" "}
            {t("intro2Suffix")}
          </p>
        </header>

        <section className="mt-8 space-y-6">
          <Card title={t("item1.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("item1.p1")}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>{t("item1.bullets.one")}</div>
              <div>{t("item1.bullets.two")}</div>
              <div>{t("item1.bullets.three")}</div>
            </div>
          </Card>

          <Card title={t("item2.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("item2.p1")}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{t("item2.p2")}</p>
            <div className="mt-5">
              <Link
                href={`${base}/mbti/cognitive-functions`}
                className="mbti-back-btn inline-flex items-center gap-2 px-4"
              >
                {t("item2.link")}
              </Link>
            </div>
          </Card>

          <Card title={t("item3.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("item3.p1")}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{t("item3.p2")}</p>
          </Card>

          <Card title={t("item4.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("item4.p1")}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{t("item4.p2")}</p>
          </Card>

          <Card title={t("item5.title")}>
            <div className="space-y-3 text-sm leading-7 text-slate-700">
              <div>{t("item5.stable")}</div>
              <div>{t("item5.complement")}</div>
              <div>{t("item5.spark")}</div>
              <div>{t("item5.explosive")}</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">{t("item5.p2")}</p>
          </Card>

          <Card title={t("item6.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("item6.p1")}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{t("item6.p2")}</p>
          </Card>

          <Card title={t("item7.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("item7.p1")}</p>
          </Card>

          <Card title={t("item8.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("item8.p1")}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{t("item8.p2")}</p>
          </Card>

          <Card title={t("item9.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("item9.p1")}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{t("item9.p2")}</p>
          </Card>

          <Card title={t("item10.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("item10.p1")}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{t("item10.p2")}</p>
          </Card>
        </section>
      </div>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mbti-card mbti-card-frame p-5">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
