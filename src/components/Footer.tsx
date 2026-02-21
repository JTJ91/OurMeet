"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";

function detectLocale(pathname: string): "ko" | "en" | "ja" {
  const m = pathname.match(/^\/(ko|en|ja)(?=\/|$)/);
  return (m?.[1] as "ko" | "en" | "ja") ?? "ko";
}

function stripLocale(pathname: string) {
  const stripped = pathname.replace(/^\/(ko|en|ja)(?=\/|$)/, "");
  return stripped || "/";
}

export default function Footer() {
  const pathname = usePathname() || "/";
  const locale = detectLocale(pathname);
  const bare = stripLocale(pathname);
  const t = useTranslations("components.footer");

  const toLocalePath = (href: string) => {
    const normalized = href.startsWith("/") ? href : `/${href}`;
    if (locale === "ko") return normalized;
    return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
  };

  const mbtiContext =
    bare.startsWith("/mbti") || bare.startsWith("/guides/mbti") || bare.startsWith("/systems/mbti");

  return (
    <footer className="bg-[#F5F9FF] pb-30 text-center text-xs text-slate-500 preview-hide">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {mbtiContext ? (
          <>
            <Link href={toLocalePath("/mbti")} className="transition hover:text-slate-700">{t("mbtiHome")}</Link>
            <span className="text-slate-300">·</span>
            <Link href={toLocalePath("/guides/mbti")} className="transition hover:text-slate-700">{t("mbtiGuides")}</Link>
            <span className="text-slate-300">·</span>
            <Link href={toLocalePath("/mbti/cognitive-functions")} className="transition hover:text-slate-700">{t("cognitive")}</Link>
            <span className="text-slate-300">·</span>
            <Link href={toLocalePath("/faq/mbti")} className="transition hover:text-slate-700">{t("faq")}</Link>
          </>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <Link href={toLocalePath("/terms")} className="transition hover:text-slate-700">{t("terms")}</Link>
        <span className="text-slate-300">·</span>
        <Link href={toLocalePath("/privacy")} className="transition hover:text-slate-700">{t("privacy")}</Link>
      </div>

      <div className="mt-4 text-[11px] text-slate-400">{t("copyright")}</div>
    </footer>
  );
}
