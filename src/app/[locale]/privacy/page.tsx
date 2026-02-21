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
  const base = `/${locale}`;

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mbti-shell pb-16 pt-10">
        <div className="mbti-card-frame mb-4 flex items-center justify-between">
          <Link
            href={`${base}/mbti`}
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <span aria-hidden>←</span>
            <span>{t("back")}</span>
          </Link>
        </div>

        <header className="mbti-card-frame rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{t("title")}</h1>
          <p className="mt-4 text-sm leading-7 text-slate-700">{t("intro")}</p>
          <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
            <p className="text-xs leading-6 text-slate-600">
              <b className="text-slate-900">{t("effectiveDateLabel")}:</b> {t("effectiveDate")}
              <br />
              <b className="text-slate-900">{t("contactLabel")}:</b>{" "}
              <span className="font-semibold text-[#1E88E5]">{t("contact")}</span>
            </p>
          </div>
        </header>

        <section className="mt-8 space-y-6">
          <Card title={t("section1.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section1.p1")}</p>

            <div className="mt-4 space-y-3 text-sm text-slate-700">
              <div>
                ✔ <b>{t("section1.required.label")}</b>: {t("section1.required.body")}
              </div>
              <div>
                ✔ <b>{t("section1.logs.label")}</b>: {t("section1.logs.body")}
              </div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">
              <b className="text-slate-900">{t("section1.noticeLabel")}:</b> {t("section1.noticeBody")}
            </p>
          </Card>

          <Card title={t("section2.title")}>
            <ul className="space-y-3 text-sm leading-7 text-slate-700">
              <li>• {t("section2.item1")}</li>
              <li>• {t("section2.item2")}</li>
              <li>• {t("section2.item3")}</li>
              <li>• {t("section2.item4")}</li>
              <li>• {t("section2.item5")}</li>
            </ul>
          </Card>

          <Card title={t("section3.title")}>
            <p className="text-sm leading-7 text-slate-700">
              {t("section3.p1Prefix")} <b>{t("section3.p1Strong")}</b>
              {t("section3.p1Suffix")}
            </p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>✔ {t("section3.item1")}</div>
              <div>✔ {t("section3.item2")}</div>
            </div>
          </Card>

          <Card title={t("section4.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section4.p1")}</p>

            <div className="mt-4 rounded-2xl bg-white/70 p-4 ring-1 ring-black/5">
              <p className="text-sm leading-7 text-slate-700">
                <b>{t("section4.adBoxLabel")}:</b> {t("section4.adBoxPrefix")}
                <b>{t("section4.adBoxStrong")}</b>
                {t("section4.adBoxSuffix")}
              </p>
            </div>
          </Card>

          <Card title={t("section5.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section5.p1")}</p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>• {t("section5.item1")}</div>
              <div>• {t("section5.item2")}</div>
              <div>• {t("section5.item3")}</div>
            </div>
          </Card>

          <Card title={t("section6.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section6.p1")}</p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>✔ {t("section6.item1")}</div>
              <div>✔ {t("section6.item2")}</div>
              <div>✔ {t("section6.item3")}</div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">{t("section6.p2")}</p>
          </Card>

          <Card title={t("section7.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section7.p1")}</p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>• {t("section7.item1")}</div>
              <div>• {t("section7.item2")}</div>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-700">{t("section7.p2")}</p>
          </Card>

          <Card title={t("section8.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section8.p1")}</p>

            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div>• {t("section8.item1")}</div>
              <div>• {t("section8.item2")}</div>
            </div>
          </Card>

          <Card title={t("section9.title")}>
            <ul className="space-y-3 text-sm leading-7 text-slate-700">
              <li>• {t("section9.item1")}</li>
              <li>• {t("section9.item2")}</li>
              <li>• {t("section9.item3")}</li>
              <li>• {t("section9.item4")}</li>
            </ul>
          </Card>

          <Card title={t("section10.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section10.p1")}</p>
          </Card>

          <Card title={t("section11.title")}>
            <p className="text-sm leading-7 text-slate-700">{t("section11.p1")}</p>
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
  children: React.ReactNode;
}) {
  return (
    <div className="mbti-card-frame rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm backdrop-blur">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <div className="mt-3">{children}</div>
    </div>
  );
}
