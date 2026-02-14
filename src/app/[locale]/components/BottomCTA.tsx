"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { readSavedGroups, removeSavedGroup, SavedGroup } from "@/app/lib/mbti/groupHistory";

function detectLocale(pathname: string): "ko" | "en" | "ja" {
  const m = pathname.match(/^\/(ko|en|ja)(?=\/|$)/);
  return (m?.[1] as "ko" | "en" | "ja") ?? "ko";
}

function toLocalePath(locale: "ko" | "en" | "ja", href: string) {
  const normalized = href.startsWith("/") ? href : `/${href}`;
  if (locale === "ko") return normalized;
  return normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
}

export default function BottomCTA({ desktopSticky = false }: { desktopSticky?: boolean }) {
  const pathname = usePathname() || "/";
  const locale = detectLocale(pathname);
  const t = useTranslations("components.bottomCta");

  const [nowTs, setNowTs] = useState(() => Date.now());
  const [groups, setGroups] = useState<SavedGroup[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  function formatRelativeTime(ts: number, now: number) {
    const diff = Math.max(0, now - ts);
    const sec = Math.floor(diff / 1000);
    const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
    if (sec < 10) return rtf.format(0, "second");
    if (sec < 60) return rtf.format(-sec, "second");
    const min = Math.floor(sec / 60);
    if (min < 60) return rtf.format(-min, "minute");
    const hour = Math.floor(min / 60);
    if (hour < 24) return rtf.format(-hour, "hour");
    const day = Math.floor(hour / 24);
    if (day < 7) return rtf.format(-day, "day");
    const week = Math.floor(day / 7);
    if (week < 5) return rtf.format(-week, "week");
    const month = Math.floor(day / 30);
    if (month < 12) return rtf.format(-month, "month");
    const year = Math.floor(day / 365);
    return rtf.format(-year, "year");
  }

  useEffect(() => {
    const onMenu = (e: Event) => {
      const ce = e as CustomEvent<{ open: boolean }>;
      setMenuOpen(!!ce.detail?.open);
      if (ce.detail?.open) setSheetOpen(false);
    };
    window.addEventListener("app:menu", onMenu as EventListener);
    return () => window.removeEventListener("app:menu", onMenu as EventListener);
  }, []);

  useEffect(() => {
    const load = () => setGroups(readSavedGroups());
    load();

    window.addEventListener("storage", load);

    return () => {
      window.removeEventListener("storage", load);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const hasAny = groups.length > 0;
  const subtitle = useMemo(() => {
    if (!hasAny) return t("recentEmpty");
    return t("recentCount", { count: groups.length });
  }, [hasAny, groups.length, t]);

  return (
    <div
      data-bottom-cta
      className={[
        desktopSticky ? "fixed inset-x-0 bottom-0 z-50" : "fixed inset-x-0 bottom-0 z-50 sm:static sm:z-auto sm:mt-10",
        menuOpen ? "hidden" : "",
      ].join(" ")}
    >
      <div className="mbti-card-frame px-5 pb-5 sm:pb-0">
        <div
          className={[
            "rounded-3xl border border-slate-200/70 bg-white/88 p-3",
            "shadow-[0_12px_34px_rgba(15,23,42,0.12)]",
            "transition-all duration-200 ease-out",
            "scale-100 opacity-100",
            desktopSticky ? "" : "sm:scale-100 sm:opacity-100 sm:bg-transparent sm:shadow-none sm:ring-0 sm:p-0",
          ].join(" ")}
        >
          <div className="grid grid-cols-2 items-stretch gap-3">
            <Link href={toLocalePath(locale, "/mbti/create")} className="block">
              <button
                type="button"
                className="mbti-primary-btn relative flex h-14 w-full items-center justify-center rounded-2xl px-4 text-sm font-extrabold text-white transition-all duration-200 active:scale-[0.98]"
              >
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span aria-hidden>✨</span>
                  <span>{t("createGroup")}</span>
                </span>
              </button>
            </Link>

            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="relative flex h-14 w-full items-center rounded-2xl border border-slate-200/70 bg-white/88 px-4 text-left shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition-all duration-200 hover:bg-white active:scale-[0.98]"
            >
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-[#1E88E5]">{t("recentGroups")}</div>
                <div className="truncate text-xs font-semibold text-slate-500">{subtitle}</div>
              </div>
              <div className="ml-auto text-lg font-extrabold text-[#1E88E5]/60">›</div>
            </button>
          </div>
        </div>
      </div>

      {sheetOpen && (
        <div className="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <button aria-label={t("close")} className="absolute inset-0 bg-black/30" onClick={() => setSheetOpen(false)} />

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[420px] px-5 pb-5">
            <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-extrabold text-slate-900">{t("recentJoined")}</div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">{hasAny ? t("tapToOpen") : t("noHistory")}</div>
                </div>

                <button
                  type="button"
                  className="rounded-xl px-3 py-2 text-xs font-extrabold text-slate-500 hover:bg-slate-100"
                  onClick={() => setSheetOpen(false)}
                >
                  {t("close")}
                </button>
              </div>

              <div className="mt-4">
                {!hasAny ? (
                  <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600">
                    {t("historyHint")}
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {groups.map((g) => {
                      const href = g.myMemberId
                        ? toLocalePath(locale, `/mbti/g/${g.id}?center=${g.myMemberId}`)
                        : toLocalePath(locale, `/mbti/g/${g.id}`);

                      return (
                        <li key={g.id} className="flex items-center gap-2">
                          <Link href={href} className="block w-full rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 hover:bg-white">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-extrabold text-slate-800">{g.name}</div>
                                {(g.myNickname || g.myMbti) && (
                                  <div className="mt-1 truncate text-[11px] font-bold text-slate-500">
                                    {g.myNickname ?? "?"}
                                    {g.myMbti ? ` · ${g.myMbti.toUpperCase()}` : ""}
                                  </div>
                                )}
                              </div>
                              <div className="shrink-0 text-[11px] font-bold text-slate-500">
                                {formatRelativeTime(g.lastSeenAt, nowTs)}
                              </div>
                            </div>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              removeSavedGroup(g.id);
                              setGroups(readSavedGroups());
                            }}
                            className="shrink-0 rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-3 text-xs font-extrabold text-slate-500 hover:bg-white"
                          >
                            {t("remove")}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
