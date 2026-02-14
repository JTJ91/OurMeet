import Link from "next/link";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import { alternatesForPath } from "@/i18n/metadata";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: alternatesForPath("/mbti/cognitive-functions", locale),
  };
}

export default async function LocalizedCognitiveFunctionsPage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "cognitive.page" });
  const base = locale === "ko" ? "" : `/${locale}`;

  return (
    <main className="mbti-page-bg">
      <div className="mbti-shell w-full max-w-3xl pb-10">
        <div className="mbti-card-frame mb-4 flex items-center justify-between">
          <Link href={`${base}/mbti`} className="mbti-back-btn">
            <span aria-hidden>←</span>
            <span>{t("back")}</span>
          </Link>
        </div>

        <header className="mbti-card mbti-card-frame p-6">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-700">
            {t("intro1")}
            <span className="font-semibold text-[#1E88E5]">{t("introHighlight")}</span>
            {t("intro1Tail")}
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-700">{t("intro2")}</p>
        </header>

        <section className="mt-8 space-y-6">
          <Card title={t("section1.title")}>
            <p className="text-sm leading-6 text-slate-700">{t("section1.lead")}</p>
            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div>{t("section1.bullets.0")}</div>
              <div>{t("section1.bullets.1")}</div>
              <div>{t("section1.bullets.2")}</div>
              <div>{t("section1.bullets.3")}</div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-700">{t("section1.tail")}</p>
          </Card>

          <Card title={t("section2.title")}>
            <div className="space-y-4 text-sm leading-6 text-slate-700">
              <div>
                <b>{t("section2.items.0.title")}</b>
                <br />
                {t("section2.items.0.body")}
              </div>
              <div>
                <b>{t("section2.items.1.title")}</b>
                <br />
                {t("section2.items.1.body")}
              </div>
              <div>
                <b>{t("section2.items.2.title")}</b>
                <br />
                {t("section2.items.2.body")}
              </div>
              <div>
                <b>{t("section2.items.3.title")}</b>
                <br />
                {t("section2.items.3.body")}
              </div>
            </div>
          </Card>

          <Card title={t("section3.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section3.lead")}</p>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>{t("section3.bullets.0")}</div>
              <div>{t("section3.bullets.1")}</div>
              <div>{t("section3.bullets.2")}</div>
              <div>{t("section3.bullets.3")}</div>
            </div>
            <p className="mt-4 text-sm leading-7 text-slate-700">{t("section3.tail")}</p>
          </Card>

          <Card title={t("section4.title")}>
            <ul className="space-y-3 text-sm leading-6 text-slate-700">
              <li>
                <b className="text-[#1E88E5]">{t("section4.items.0.label")}</b>
                {" "}
                {t("section4.items.0.body")}
              </li>
              <li>
                <b className="text-[#00C853]">{t("section4.items.1.label")}</b>
                {" "}
                {t("section4.items.1.body")}
              </li>
              <li>
                <b className="text-[#FDD835]">{t("section4.items.2.label")}</b>
                {" "}
                {t("section4.items.2.body")}
              </li>
              <li>
                <b className="text-[#FB8C00]">{t("section4.items.3.label")}</b>
                {" "}
                {t("section4.items.3.body")}
              </li>
              <li>
                <b className="text-[#D50000]">{t("section4.items.4.label")}</b>
                {" "}
                {t("section4.items.4.body")}
              </li>
            </ul>
          </Card>

          <Card title={t("section5.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section5.p1")}</p>
            <p className="mt-3 text-sm leading-7 text-slate-700">{t("section5.p2")}</p>
          </Card>
        </section>
      </div>
    </main>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mbti-card mbti-card-frame p-5">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
