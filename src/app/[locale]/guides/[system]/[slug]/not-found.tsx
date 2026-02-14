import Link from "next/link";
import { getTranslations } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function LocalizedGuideNotFound({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guides.notFound" });
  const base = locale === "ko" ? "" : `/${locale}`;

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mbti-shell pb-16 pt-10">
        <div className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h1 className="text-xl font-extrabold">{t("title")}</h1>
          <p className="mt-3 text-sm text-slate-700">{t("description")}</p>
          <div className="mt-6 flex gap-3">
            <Link href={`${base}/guides/mbti`} className="rounded-full bg-[#1E88E5] px-5 py-2 text-sm font-semibold text-white">
              {t("list")}
            </Link>
            <Link href={`${base}/`} className="rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700">
              {t("home")}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
