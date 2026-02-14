import Link from "next/link";
import { getTranslations } from "next-intl/server";
import CreateFormClientIntl from "./CreateFormClientIntl";

type Props = {
  params: Promise<{ locale: string }>;
};

function localeBase(locale: string) {
  return locale === "ko" ? "" : `/${locale}`;
}

export default async function LocalizedCreatePage({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "create.page" });
  const base = localeBase(locale);

  return (
    <main className="mbti-page-bg pb-10">
      <div className="mbti-shell flex flex-col">
        <div className="mbti-card-frame flex items-center justify-between">
          <Link href={`${base}/mbti`} className="mbti-back-btn">
            <span aria-hidden>{"<"}</span>
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
              {t("description2")}
            </p>
          </div>
        </section>

        <section className="mt-6">
          <div className="mbti-card mbti-card-frame p-5">
            <CreateFormClientIntl locale={locale} />
          </div>
        </section>
      </div>
    </main>
  );
}
