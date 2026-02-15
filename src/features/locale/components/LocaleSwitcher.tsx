"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

const localeLabel: Record<Locale, string> = {
  ko: "KO",
  en: "EN",
  ja: "JA",
};

export default function LocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const currentLocale = (pathname.match(/^\/(ko|en|ja)(?=\/|$)/)?.[1] ?? "ko") as Locale;
  const containerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const stripLocalePrefix = (value: string) => {
    const stripped = value.replace(/^\/(ko|en|ja)(?=\/|$)/, "");
    return stripped === "" ? "/" : stripped;
  };

  const onChangeLocale = (nextLocale: Locale) => {
    const basePath = stripLocalePrefix(pathname);
    if (nextLocale === "ko") {
      router.replace(basePath);
      return;
    }
    router.replace(basePath === "/" ? `/${nextLocale}` : `/${nextLocale}${basePath}`);
  };

  useEffect(() => {
    if (!expanded) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setExpanded(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setExpanded(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [expanded]);

  const onClickLocale = (nextLocale: Locale) => {
    if (nextLocale === currentLocale) {
      setExpanded(false);
      return;
    }
    setExpanded(false);
    onChangeLocale(nextLocale);
  };

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className={[
          "flex h-8 min-w-[52px] items-center justify-center gap-1 rounded-full border px-3 text-[11px] font-bold shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition",
          expanded
            ? "border-[#1E88E5]/35 bg-[#1E88E5]/8 text-[#1E88E5]"
            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
        ].join(" ")}
        aria-expanded={expanded}
        aria-haspopup="listbox"
      >
        <span>{localeLabel[currentLocale]}</span>
        <span
          aria-hidden
          className={["text-[10px] leading-none transition-transform", expanded ? "rotate-180" : ""].join(" ")}
        >
          ▾
        </span>
      </button>

      <div
        className={[
          "absolute left-1/2 top-[calc(100%+6px)] z-20 w-[76px] -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-1 shadow-[0_8px_24px_rgba(15,23,42,0.12)] transition-all duration-150",
          expanded ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0",
        ].join(" ")}
      >
        {locales.map((locale) => {
          const active = locale === currentLocale;

          return (
            <button
              key={locale}
              type="button"
              onClick={() => onClickLocale(locale)}
              className={[
                "mb-1 flex h-7 w-full items-center justify-center rounded-lg text-[11px] font-bold transition last:mb-0",
                active ? "bg-[#1E88E5]/10 text-[#1E88E5]" : "text-slate-600 hover:bg-slate-100",
              ].join(" ")}
              aria-current={active ? "true" : undefined}
              aria-label={active ? `Current language ${localeLabel[locale]}` : `Change language to ${localeLabel[locale]}`}
            >
              {localeLabel[locale]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
