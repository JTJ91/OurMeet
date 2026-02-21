import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import MbtiTestClient from "@/features/mbti/mbti-test/MbtiTestClient";
import { alternatesForPath } from "@/i18n/metadata";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    from?: string | string[];
    groupId?: string | string[];
    returnTo?: string | string[];
  }>;
};

function localeBase(locale: string) {
  return `/${locale}`;
}

function readFirst(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "mbtiTest.page" });
  const metaTitle = t("metaTitle");
  const metaDescription = t("metaDescription");
  const keywords = t("metaKeywords")
    .split(",")
    .map((kw) => kw.trim())
    .filter(Boolean);

  return {
    title: metaTitle,
    description: metaDescription,
    keywords,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: metaTitle,
      description: metaDescription,
    },
    alternates: alternatesForPath("/mbti-test", locale),
  };
}

export default async function LocalizedMbtiTestPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const sp = (await searchParams) ?? {};
  const t = await getTranslations({ locale, namespace: "mbtiTest.page" });
  const base = localeBase(locale);
  const from = readFirst(sp.from);
  const groupId = readFirst(sp.groupId);
  const returnTo = readFirst(sp.returnTo);

  const quickQuery = new URLSearchParams();
  if (from) quickQuery.set("from", from);
  if (groupId) quickQuery.set("groupId", groupId);
  if (returnTo) quickQuery.set("returnTo", returnTo);
  const quickHref = `${base}/mbti-test/quick${quickQuery.toString() ? `?${quickQuery.toString()}` : ""}`;

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
            href={quickHref}
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
