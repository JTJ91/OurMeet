"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { readSavedGroups, removeSavedGroup, SavedGroup } from "@/app/lib/mbti/groupHistory";
import LocaleSwitcher from "@/app/[locale]/components/LocaleSwitcher";

type Locale = "ko" | "en" | "ja";

type TreeItem =
  | { type: "heading"; label: string }
  | { type: "link"; label: string; desc?: string; href: string; disabled?: boolean }
  | { type: "action"; label: string; desc?: string; action: "recent" };

type TreeGroup = {
  key: "mbti" | "saju";
  title: string;
  desc?: string;
  children: TreeItem[];
};

function detectLocale(pathname: string): Locale {
  const m = pathname.match(/^\/(ko|en|ja)(?=\/|$)/);
  return (m?.[1] as Locale) ?? "ko";
}

function stripLocale(pathname: string) {
  const stripped = pathname.replace(/^\/(ko|en|ja)(?=\/|$)/, "");
  return stripped || "/";
}

function formatRelativeTime(locale: Locale, deltaMs: number) {
  const sec = Math.floor(deltaMs / 1000);
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

function MenuIcon({ open }: { open: boolean }) {
  return (
    <div className="relative h-4 w-4.5">
      <span
        className={[
          "absolute left-0 top-0 h-[1.5px] w-4.5 rounded bg-slate-900 transition-all duration-300",
          open ? "top-[6px] rotate-45" : "",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[6px] h-[1.5px] w-4.5 rounded bg-slate-900 transition-all duration-300",
          open ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[12px] h-[1.5px] w-4.5 rounded bg-slate-900 transition-all duration-300",
          open ? "top-[6px] -rotate-45" : "",
        ].join(" ")}
      />
    </div>
  );
}

export default function AppHeader() {
  const pathname = usePathname() || "/";
  const locale = detectLocale(pathname);
  const barePath = stripLocale(pathname);
  const isRootPage = barePath === "/";

  const t = useTranslations("components.header");
  const d = useTranslations("components.headerDrawer");
  const brand = t("brand");
  const accentStart = brand.toLowerCase().lastIndexOf("rank");
  const hasAccent = accentStart > 0;

  const [open, setOpen] = useState(false);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [openKey, setOpenKey] = useState<"mbti" | "saju" | null>("mbti");
  const [recentOpen, setRecentOpen] = useState(false);
  const [groups, setGroups] = useState<SavedGroup[]>([]);

  const toLocalePath = (href: string) => {
    const normalized = href.startsWith("/") ? href : `/${href}`;
    return locale === "ko" ? normalized : normalized === "/" ? `/${locale}` : `/${locale}${normalized}`;
  };

  const tree: TreeGroup[] = useMemo(
    () => [
      {
        key: "mbti",
        title: d("mbti.title"),
        desc: d("mbti.desc"),
        children: [
          { type: "link", label: d("mbti.home"), href: "/mbti" },
          { type: "link", label: d("mbti.test"), href: "/mbti-test" },
          { type: "heading", label: d("mbti.guideSection") },
          { type: "link", label: d("mbti.cognitive"), href: "/mbti/cognitive-functions" },
          { type: "link", label: d("mbti.groupGuide"), href: "/guides/mbti" },
          { type: "link", label: "FAQ", href: "/faq/mbti" },
          { type: "heading", label: d("mbti.groupSection") },
          { type: "link", label: d("mbti.create"), href: "/mbti/create" },
          { type: "action", label: d("mbti.recent"), action: "recent" },
        ],
      },
      {
        key: "saju",
        title: d("saju.title"),
        desc: d("saju.desc"),
        children: [
          { type: "link", label: d("saju.comingSoon"), href: "#", disabled: true },
        ],
      },
    ],
    [d]
  );

  useEffect(() => {
    window.dispatchEvent(new CustomEvent("app:menu", { detail: { open } }));
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setRecentOpen(false);
        setOpenKey(null);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    const onStorage = () => setGroups(readSavedGroups());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpen(false);
      setRecentOpen(false);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  const closeDrawer = () => {
    setOpen(false);
    setRecentOpen(false);
    setOpenKey(null);
  };

  const toggleDrawer = () => {
    setOpen((v) => {
      const next = !v;
      if (next) {
        setGroups(readSavedGroups());
        setOpenKey((k) => (isRootPage ? null : k ?? "mbti"));
      } else {
        setRecentOpen(false);
        setOpenKey(null);
      }
      return next;
    });
  };

  const isActiveHref = (href: string) => {
    if (href === "/mbti") return barePath === "/mbti";
    return barePath === href || barePath.startsWith(`${href}/`);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex h-12 max-w-[740px] items-center px-3 sm:px-5">
          <Link href={toLocalePath("/")} className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
            <span className="truncate text-sm font-extrabold tracking-tight text-slate-900">
              {hasAccent ? brand.slice(0, accentStart) : brand}
              {hasAccent ? <span className="text-[#1E88E5]">{brand.slice(accentStart)}</span> : null}
            </span>
            <span className="rounded-full bg-[#1E88E5]/12 px-2 py-0.5 text-[11px] font-extrabold text-[#1E88E5] ring-1 ring-[#1E88E5]/20">
              beta
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LocaleSwitcher />
            <button
              type="button"
              onClick={toggleDrawer}
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white/85 shadow-[0_4px_12px_rgba(15,23,42,0.05)] backdrop-blur-sm transition hover:bg-white"
              aria-label={open ? d("close") : d("open")}
              aria-expanded={open}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>
      </header>

      <div className={["fixed inset-0 z-50", open ? "pointer-events-auto" : "pointer-events-none"].join(" ")}>
        <button
          type="button"
          aria-label={d("close")}
          onClick={closeDrawer}
          className={[
            "absolute inset-0 transition-opacity duration-300",
            open ? "opacity-100 bg-black/35" : "opacity-0 bg-black/0",
          ].join(" ")}
        />

        <aside
          className={[
            "absolute right-0 top-0 h-full w-[320px] max-w-[85vw]",
            "bg-white/90 backdrop-blur-xl shadow-[0_20px_48px_rgba(15,23,42,0.18)] ring-1 ring-slate-200/70",
            "overflow-hidden transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full flex-col p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-extrabold tracking-wide text-slate-500">{d("navigation")}</div>
                <div className="mt-1 text-lg font-black text-slate-900">{d("quickMenu")}</div>
              </div>

              <button
                onClick={closeDrawer}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:bg-slate-50"
                aria-label={d("close")}
              >
                <span aria-hidden>×</span>
              </button>
            </div>

            <nav className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 overscroll-contain">
              <div className="rounded-3xl border border-slate-200/70 bg-white/85 shadow-[0_8px_20px_rgba(15,23,42,0.05)] backdrop-blur-sm">
                <ul className="divide-y divide-black/5">
                  {tree.map((g) => {
                    const expanded = openKey === g.key;
                    const disabledGroup = g.key === "saju";

                    return (
                      <li key={g.key}>
                        <button
                          type="button"
                          onClick={() => {
                            if (disabledGroup) return;
                            setOpenKey((v) => (v === g.key ? null : g.key));
                          }}
                          className={[
                            "group flex w-full items-center gap-3 px-4 py-3 text-left transition",
                            disabledGroup ? "cursor-not-allowed opacity-60" : "hover:bg-slate-900/5 active:bg-slate-900/[0.07]",
                          ].join(" ")}
                          aria-expanded={!disabledGroup && expanded}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-extrabold text-slate-900">{g.title}</div>
                            {g.desc ? <div className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">{g.desc}</div> : null}
                          </div>
                          <span
                            aria-hidden
                            className={[
                              "inline-flex h-8 w-8 items-center justify-center rounded-2xl",
                              "bg-white/60 ring-1 ring-black/10 text-slate-400 transition",
                              expanded ? "rotate-90 bg-white text-[#1E88E5]" : "",
                            ].join(" ")}
                          >
                            ›
                          </span>
                        </button>

                        <div
                          className={[
                            "grid transition-[grid-template-rows] duration-300 ease-out",
                            expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                          ].join(" ")}
                        >
                          <div className="overflow-hidden">
                            <ul className="pb-3 pt-1">
                              {g.children.map((it, idx) => {
                                if (it.type === "heading") {
                                  return (
                                    <li key={`h-${g.key}-${idx}`} className="px-6 pt-3">
                                      <div className="text-[11px] font-extrabold tracking-wide text-slate-400">{it.label.toUpperCase()}</div>
                                    </li>
                                  );
                                }

                                if (it.type === "link") {
                                  const active = !it.disabled && isActiveHref(it.href);
                                  if (it.disabled) {
                                    return (
                                      <li key={`${g.key}-${idx}`}>
                                        <div className="relative flex items-center px-6 py-2 text-sm font-semibold text-slate-400 cursor-not-allowed">
                                          <span className="truncate">{it.label}</span>
                                        </div>
                                      </li>
                                    );
                                  }

                                  return (
                                    <li key={it.href}>
                                      <Link
                                        href={toLocalePath(it.href)}
                                        onClick={closeDrawer}
                                        className={[
                                          "group relative flex items-center px-8 py-2 text-sm font-semibold transition",
                                          active ? "text-[#1E88E5] bg-[#1E88E5]/5" : "text-slate-700 hover:bg-slate-900/5",
                                        ].join(" ")}
                                      >
                                        <span className="truncate">{it.label}</span>
                                      </Link>
                                    </li>
                                  );
                                }

                                return (
                                  <li key={`recent-${g.key}`}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setGroups(readSavedGroups());
                                        setRecentOpen((v) => !v);
                                      }}
                                      className={[
                                        "group relative flex w-full items-center px-8 py-2 text-left text-sm font-semibold transition",
                                        recentOpen ? "text-[#1E88E5] bg-[#1E88E5]/5" : "text-slate-700 hover:bg-slate-900/5",
                                      ].join(" ")}
                                      aria-expanded={recentOpen}
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="truncate">{it.label}</div>
                                        <div className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                                          {groups.length ? d("recentSavedCount", { count: groups.length }) : d("recentNone")}
                                        </div>
                                      </div>
                                      <span aria-hidden className={["ml-2 inline-flex h-8 w-8 items-center justify-center rounded-2xl bg-white/60 ring-1 ring-black/10 text-slate-400 transition", recentOpen ? "rotate-90 bg-white text-[#1E88E5]" : ""].join(" ")}>
                                        ›
                                      </span>
                                    </button>

                                    <div className={["grid transition-[grid-template-rows] duration-300 ease-out", recentOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"].join(" ")}>
                                      <div className="overflow-hidden">
                                        <div className="px-4 pb-3">
                                          <div className="mt-2 rounded-3xl border border-slate-200/70 bg-white/88 p-3">
                                            {!groups.length ? (
                                              <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-3 text-xs font-semibold text-slate-600">
                                                {d("recentEmptyHelp")}
                                              </div>
                                            ) : (
                                              <ul className="space-y-2">
                                                {groups.map((gr) => {
                                                  const href = gr.myMemberId ? `/mbti/g/${gr.id}?center=${gr.myMemberId}` : `/mbti/g/${gr.id}`;
                                                  return (
                                                    <li key={gr.id} className="flex items-center gap-2">
                                                      <Link
                                                        href={toLocalePath(href)}
                                                        onClick={closeDrawer}
                                                        className="group flex-1 rounded-2xl border border-slate-200/70 bg-white/85 px-3 py-2 hover:bg-white transition"
                                                      >
                                                        <div className="flex items-start justify-between gap-2">
                                                          <div className="min-w-0">
                                                            <div className="truncate text-xs font-extrabold text-slate-900">{gr.name}</div>
                                                            {(gr.myNickname || gr.myMbti) ? (
                                                              <div className="mt-0.5 truncate text-[11px] font-bold text-slate-500">
                                                                {gr.myNickname ?? "?"}
                                                                {gr.myMbti ? ` · ${gr.myMbti.toUpperCase()}` : ""}
                                                              </div>
                                                            ) : null}
                                                          </div>

                                                          <span className="shrink-0 text-[11px] font-bold text-slate-400">
                                                            {formatRelativeTime(locale, nowTs - gr.lastSeenAt)}
                                                          </span>
                                                        </div>
                                                      </Link>

                                                      <button
                                                        type="button"
                                                        onClick={() => {
                                                          removeSavedGroup(gr.id);
                                                          setGroups(readSavedGroups());
                                                        }}
                                                        className="shrink-0 rounded-2xl border border-slate-200/70 bg-white/85 px-3 py-2 text-[11px] font-extrabold text-slate-500 hover:bg-white hover:text-slate-700 transition"
                                                        aria-label={d("remove")}
                                                        title={d("remove")}
                                                      >
                                                        {d("remove")}
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
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>

            <div className="mt-auto pt-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 text-xs leading-relaxed text-slate-600">
                <b className="text-slate-800">{d("tipTitle")}</b> {d("tipBody")}
              </div>

              <div className="mt-3 text-[11px] font-semibold text-slate-400">© 2026 moimrank</div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
