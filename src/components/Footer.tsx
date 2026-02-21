"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { toLocalePath } from "@/i18n/path";

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

  const toPath = (href: string) => toLocalePath(locale, href);

  const mbtiContext =
    bare.startsWith("/mbti") || bare.startsWith("/guides/mbti") || bare.startsWith("/systems/mbti");

  return (
    <footer className="bg-[#F5F9FF] pb-30 text-center text-xs text-slate-500 preview-hide">
      <div className="flex flex-wrap items-center justify-center gap-3">
        {mbtiContext ? (
          <>
            <Link href={toPath("/mbti")} className="transition hover:text-slate-700">{t("mbtiHome")}</Link>
            <span className="text-slate-300">·</span>
            <Link href={toPath("/guides/mbti")} className="transition hover:text-slate-700">{t("mbtiGuides")}</Link>
            <span className="text-slate-300">·</span>
            <Link href={toPath("/mbti/cognitive-functions")} className="transition hover:text-slate-700">{t("cognitive")}</Link>
            <span className="text-slate-300">·</span>
            <Link href={toPath("/faq/mbti")} className="transition hover:text-slate-700">{t("faq")}</Link>
          </>
        ) : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
        <Link href={toPath("/terms")} className="transition hover:text-slate-700">{t("terms")}</Link>
        <span className="text-slate-300">·</span>
        <Link href={toPath("/privacy")} className="transition hover:text-slate-700">{t("privacy")}</Link>
      </div>

      <div className="mt-4 text-[11px] text-slate-400">{t("copyright")}</div>
    </footer>
  );
}
