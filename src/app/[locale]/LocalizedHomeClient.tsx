"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

export default function LocalizedHomeClient() {
  const t = useTranslations();
  const pathname = usePathname() || "/";
  const localePrefix = pathname.match(/^\/(en|ja)(?=\/|$)/)?.[1] ?? "ko";
  const withLocale = (href: string) => {
    if (localePrefix === "ko") return href;
    return href === "/" ? `/${localePrefix}` : `/${localePrefix}${href}`;
  };

  return (
    <main className="mx-auto max-w-[740px] px-5 py-16">
      <h1 className="text-3xl font-black text-slate-900">{t("home.title")}</h1>
      <p className="mt-4 text-slate-600">{t("home.description")}</p>
      <nav className="mt-8 flex items-center gap-3 text-sm font-semibold">
        <Link href={withLocale("/")} className="rounded-full bg-slate-900 px-4 py-2 text-white">
          {t("nav.home")}
        </Link>
        <Link href={withLocale("/mbti")} className="rounded-full border border-slate-300 px-4 py-2 text-slate-700">
          {t("nav.mbti")}
        </Link>
      </nav>
    </main>
  );
}
