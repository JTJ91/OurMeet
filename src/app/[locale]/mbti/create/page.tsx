import type { Metadata } from "next";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import CreateFormClientIntl from "@/features/mbti/create/CreateFormClientIntl";
import { alternatesForPath } from "@/i18n/metadata";
import { getScopedMessages } from "@/i18n/scoped-messages";

type Props = {
  params: Promise<{ locale: string }>;
};

function localeBase(locale: string) {
  return `/${locale}`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return {
    alternates: alternatesForPath("/mbti/create", locale),
  };
}

export default async function LocalizedCreatePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "create.page" });
  const base = localeBase(locale);
  const messages = await getScopedMessages(locale, ["create.form"]);

  return (
    <main className="mbti-page-bg pb-10">
      <div className="mbti-shell flex flex-col">
        <div className="mbti-card-frame flex items-center justify-between">
          <Link href={`${base}/mbti`} className="mbti-back-btn">
            <span aria-hidden>←</span>
            <span>{t("back")}</span>
          </Link>
        </div>

        <section className="mt-4">
          <div className="mbti-card mbti-card-frame p-6">
            <h2 className="text-2xl font-extrabold leading-tight">
              <span className="underline decoration-[#FDD835]/70">{t("title")}</span>
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              {t("description1")}
              <br />
              {t("description2Prefix")} <b className="text-slate-800">{t("description2Strong")}</b>
              {t("description2Suffix")}
            </p>
          </div>
        </section>

        <section className="mt-6">
          <div className="mbti-card mbti-card-frame p-5">
            <NextIntlClientProvider messages={messages}>
              <CreateFormClientIntl locale={locale} />
            </NextIntlClientProvider>
          </div>
        </section>
      </div>
    </main>
  );
}
