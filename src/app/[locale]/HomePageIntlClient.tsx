"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

type Props = {
  locale: string;
};

export default function HomePageIntlClient({ locale }: Props) {
  const t = useTranslations("landing");
  const base = locale === "ko" ? "" : `/${locale}`;

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mbti-shell flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">
        <div className="relative text-4xl font-black tracking-tight sm:text-5xl">
          <span>
            {t("brandPrefix")}
            <span className="text-[#1E88E5]">{t("brandAccent")}</span>
          </span>

          <span
            className="
            absolute -right-12 -top-2
            rounded-full bg-[#1E88E5]/10
            px-2 py-0.5
            text-[11px] font-extrabold
            text-[#1E88E5]
          "
          >
            beta
          </span>
        </div>

        <div className="mt-10 flex justify-center">
          <div className="h-[2px] w-12 rounded-full bg-[#1E88E5]/40" />
        </div>

        <h1 className="mt-8 max-w-[620px] text-xl font-extrabold leading-relaxed text-slate-800 sm:text-2xl">
          {t("headline1")}
          <br className="hidden sm:block" />
          {t("headline2")}
        </h1>

        <p className="mt-6 max-w-[640px] text-[15px] leading-8 text-slate-600">{t("description1")}</p>

        <p className="mt-6 max-w-[600px] text-[14px] leading-7 text-slate-500">{t("description2")}</p>

        <div className="mt-12 flex w-full max-w-[500px] flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href={`${base}/mbti`}
            target="_self"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[#1E88E5] px-6 py-3 text-sm font-extrabold text-white transition hover:opacity-95"
          >
            {t("startMbti")}
          </Link>

          <button
            type="button"
            disabled
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-extrabold text-slate-400"
            aria-disabled="true"
          >
            {t("sajuSoon")}
          </button>
        </div>

        <div className="mt-10 text-[12px] font-medium text-slate-400">{t("footer")}</div>
      </div>
    </main>
  );
}
