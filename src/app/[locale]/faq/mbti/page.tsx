import Link from "next/link";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

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
          <p className="mt-4 text-sm leading-7 text-slate-700">{t("intro")}</p>
        </header>

        <section className="mt-8 space-y-4">
          <QA title={t("q1")} body={t("a1")} />
          <QA title={t("q2")} body={t("a2")} />
          <QA title={t("q3")} body={t("a3")} />
        </section>
      </div>
    </main>
  );
}

function QA({ title, body }: { title: string; body: string }) {
  return (
    <div className="mbti-card mbti-card-frame p-5">
      <h2 className="text-base font-extrabold text-slate-900">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-slate-700">{body}</p>
    </div>
  );
}
