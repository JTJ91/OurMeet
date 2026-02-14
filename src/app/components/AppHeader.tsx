"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { readSavedGroups, removeSavedGroup, SavedGroup } from "@/app/lib/mbti/groupHistory";
import LocaleSwitcher from "@/app/components/LocaleSwitcher";

type TreeItem =
  | { type: "heading"; label: string }
  | { type: "link"; label: string; desc?: string; href: string; disabled?: boolean }
  | { type: "action"; label: string; desc?: string; action: "recent" };


type TreeGroup = {
  key: "mbti" | "saju";
  title: string;
  desc?: string;
  icon?: string;
  children: TreeItem[];
};

const TREE: TreeGroup[] = [
  {
    key: "mbti",
    title: "MBTI",
    desc: "인지기능 기반 케미",
    icon: "🧠",
    children: [
      { type: "link", label: "MBTI 홈", desc: "메인으로 이동", href: "/mbti" },

      // ✅ 여기 추가
      { type: "link", label: "MBTI 검사", desc: "60문항 정식 검사", href: "/mbti-test" },

      { type: "heading", label: "가이드" },
      { type: "link", label: "인지기능", desc: "개념을 3분만에", href: "/mbti/cognitive-functions" },
      { type: "link", label: "모임 속 MBTI", desc: "친구/회사/동네/운동/게임", href: "/guides/mbti" },
      { type: "link", label: "FAQ", desc: "자주 묻는 질문", href: "/faq/mbti" },

      { type: "heading", label: "모임" },
      { type: "link", label: "방 만들기", desc: "새 모임 생성", href: "/mbti/create" },
      { type: "action", label: "최근 모임", desc: "로컬 저장 목록", action: "recent" },
    ],
  },
  {
    key: "saju",
    title: "사주",
    desc: "준비중",
    icon: "🔮",
    children: [
      { type: "link", label: "사주 홈", desc: "준비중", href: "#", disabled: true },

      { type: "heading", label: "가이드" },
      { type: "link", label: "사주 가이드", desc: "준비중", href: "#", disabled: true },
      { type: "link", label: "FAQ", desc: "준비중", href: "#", disabled: true },

      { type: "heading", label: "모임" },
      { type: "link", label: "방 만들기", desc: "준비중", href: "#", disabled: true },
      { type: "action", label: "최근 모임", desc: "로컬 저장 목록", action: "recent" },
    ],
  },
];



function formatRelativeTime(ts: number) {
  const diff = ts;
  const sec = Math.floor(diff / 1000);

  if (sec < 10) return "방금";
  if (sec < 60) return `${sec}초 전`;

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;

  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;

  const day = Math.floor(hour / 24);
  if (day < 7) return `${day}일 전`;

  const week = Math.floor(day / 7);
  if (week < 5) return `${week}주 전`;

  const month = Math.floor(day / 30);
  if (month < 12) return `${month}개월 전`;

  const year = Math.floor(day / 365);
  return `${year}년 전`;
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
  const pathname = usePathname();
  const isRootPage = (pathname ?? "/") === "/";

  const [open, setOpen] = useState(false);
  const [nowTs, setNowTs] = useState(() => Date.now());
  const [openKey, setOpenKey] = useState<"mbti" | "saju" | null>("mbti");

  const [recentOpen, setRecentOpen] = useState(false);
  const [groups, setGroups] = useState<SavedGroup[]>([]);

  // ✅ 메뉴 열림/닫힘 상태 브로드캐스트(바텀CTA 숨김용)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("app:menu", { detail: { open } }));
  }, [open]);

  // ✅ 열렸을 때 스크롤 잠금 + ESC 닫기
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setRecentOpen(false);
      setOpenKey(null);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ✅ drawer 열릴 때마다 최근 목록 로드
  // ✅ 다른 탭에서 바뀐 경우도 반영
  useEffect(() => {
    const onStorage = () => setGroups(readSavedGroups());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ drawer 닫히면 하위 트리 정리
  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

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
  // ✅ 홈 링크는 "정확히 일치"만
  if (href === "/mbti") return pathname === "/mbti";
  if (href === "/saju") return pathname === "/saju";

  return pathname === href || pathname.startsWith(href + "/");
};


  return (
    <>
      <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95">
        <div className="mx-auto flex h-12 max-w-[740px] items-center px-3 sm:px-5">
          {/* Brand */}
          <Link href="/" className="flex min-w-0 flex-1 items-center gap-1.5 pr-2">
            <span className="truncate text-sm font-extrabold tracking-tight text-slate-900">
              모임<span className="text-[#1E88E5]">랭킹</span>
            </span>

            {/* ✅ beta 배지 */}
            <span className="rounded-full bg-[#1E88E5]/12 px-2 py-0.5 text-[11px] font-extrabold text-[#1E88E5] ring-1 ring-[#1E88E5]/20">
              beta
            </span>
          </Link>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <LocaleSwitcher />
            <button
              type="button"
              onClick={toggleDrawer}
              className="group inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white shadow-[0_4px_12px_rgba(15,23,42,0.05)] transition hover:bg-white"
              aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
              aria-expanded={open}
            >
              <MenuIcon open={open} />
            </button>
          </div>
        </div>
      </header>

      {/* Overlay + Drawer */}
      <div
        className={[
          "fixed inset-0 z-50",
          open ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        {/* Dim */}
        <button
          type="button"
          aria-label="닫기"
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
            "overflow-hidden",
            "transition-transform duration-300 ease-out",
            open ? "translate-x-0" : "translate-x-full",
          ].join(" ")}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex h-full flex-col p-5">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-extrabold tracking-wide text-slate-500">
                  NAVIGATION
                </div>
                <div className="mt-1 text-lg font-black text-slate-900">
                  빠른 메뉴
                </div>
              </div>

              <button
                onClick={closeDrawer}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:bg-slate-50"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {/* ✅ Tree Nav */}
            <nav className="mt-5 min-h-0 flex-1 overflow-y-auto pr-1 overscroll-contain">
              <div className="rounded-3xl border border-slate-200/70 bg-white/85 shadow-[0_8px_20px_rgba(15,23,42,0.05)] backdrop-blur-sm">
                <ul className="divide-y divide-black/5">
                  {TREE.map((g) => {
                    const expanded = openKey === g.key;
                    const isDisabledGroup = g.key === "saju";

                    return (
                      <li key={g.key}>
                        {/* Parent */}
                        <button
                          type="button"
                          onClick={() => {
                            if (isDisabledGroup) return;   // 🔒 사주 클릭 차단
                            setOpenKey((v) => (v === g.key ? null : g.key));
                          }}
                          className={[
                            "group flex w-full items-center gap-3 px-4 py-3 text-left transition",
                            isDisabledGroup
                              ? "cursor-not-allowed opacity-60"
                              : "hover:bg-slate-900/5 active:bg-slate-900/[0.07]",
                          ].join(" ")}
                          aria-expanded={!isDisabledGroup && expanded}
                        >

                          <div className="min-w-0 flex-1">
                            <div className="truncate text-sm font-extrabold text-slate-900">
                              {g.title}
                            </div>
                            {g.desc && (
                              <div className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                                {g.desc}
                              </div>
                            )}
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

                        {/* Children */}
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
                                      <div className="text-[11px] font-extrabold tracking-wide text-slate-400">
                                        {it.label.toUpperCase()}
                                      </div>
                                    </li>
                                  );
                                }
                                
                                // (A) 링크
                                if (it.type === "link") {
                                  const active = isActiveHref(it.href);

                                  if (it.disabled) {
                                    return (
                                      <li key={it.label}>
                                        <div
                                          className="
                                            relative flex items-center px-6 py-2
                                            text-sm font-semibold text-slate-400
                                            cursor-not-allowed
                                          "
                                        >
                                          <span className="absolute left-4 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full bg-transparent" />
                                          <span className="truncate">{it.label}</span>
                                          <span className="ml-2 text-[10px] font-bold text-slate-400">준비중</span>
                                        </div>
                                      </li>
                                    );
                                  }

                                  return (
                                    <li key={it.href}>
                                      <Link
                                        href={it.href}
                                        onClick={closeDrawer}
                                        className={[
                                          "group relative flex items-center px-8 py-2",
                                          "text-sm font-semibold transition",
                                          active
                                            ? "text-[#1E88E5] bg-[#1E88E5]/5"
                                            : "text-slate-700 hover:bg-slate-900/5",
                                        ].join(" ")}
                                      >
                                        <span
                                          aria-hidden
                                          className={[
                                            "absolute left-6 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full transition",
                                            active ? "bg-[#1E88E5]" : "bg-transparent group-hover:bg-[#1E88E5]",
                                          ].join(" ")}
                                        />
                                        <span className="truncate">{it.label}</span>
                                      </Link>
                                    </li>
                                  );
                                }


                                // (B) 최근 모임 토글
                                return (
                                  <li key={`recent-${g.key}`}>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setGroups(readSavedGroups());
                                        setRecentOpen((v) => !v);
                                      }}
                                      className={[
                                        "group relative flex w-full items-center px-8 py-2 text-left",
                                        "text-sm font-semibold transition",
                                        recentOpen
                                          ? "text-[#1E88E5] bg-[#1E88E5]/5"
                                          : "text-slate-700 hover:bg-slate-900/5",
                                      ].join(" ")}
                                      aria-expanded={recentOpen}
                                    >
                                      {/* 왼쪽 인디케이터 */}
                                      <span
                                        aria-hidden
                                        className={[
                                          "absolute left-4 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full transition",
                                          recentOpen ? "bg-[#1E88E5]" : "bg-transparent group-hover:bg-[#1E88E5]",
                                        ].join(" ")}
                                      />

                                      <div className="min-w-0 flex-1">
                                        <div className="truncate">{it.label}</div>
                                        <div className="mt-0.5 truncate text-[11px] font-semibold text-slate-500">
                                          {groups.length ? `저장된 모임 ${groups.length}개` : "저장된 모임 없음"}
                                        </div>
                                      </div>

                                      <span
                                        aria-hidden
                                        className={[
                                          "ml-2 inline-flex h-8 w-8 items-center justify-center rounded-2xl",
                                          "bg-white/60 ring-1 ring-black/10 text-slate-400 transition",
                                          recentOpen ? "rotate-90 bg-white text-[#1E88E5]" : "",
                                        ].join(" ")}
                                      >
                                        ›
                                      </span>
                                    </button>

                                    {/* 최근 모임 리스트 */}
                                    <div
                                    className={[
                                        "grid transition-[grid-template-rows] duration-300 ease-out",
                                        recentOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                                    ].join(" ")}
                                    >
                                    <div className="overflow-hidden">
                                        <div className="px-4 pb-3">
                                        {/* ✅ panel */}
                                        <div className="mt-2 rounded-3xl border border-slate-200/70 bg-white/88 p-3">
                                            {!groups.length ? (
                                            <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-3 text-xs font-semibold text-slate-600">
                                                모임을 만들거나 참여하면 여기에 기록돼요
                                            </div>
                                            ) : (
                                            <ul className="space-y-2">
                                                {groups.map((gr) => {
                                                const href = gr.myMemberId
                                                    ? `/mbti/g/${gr.id}?center=${gr.myMemberId}`
                                                    : `/mbti/g/${gr.id}`;

                                                return (
                                                    <li key={gr.id} className="flex items-center gap-2">
                                                    <Link
                                                        href={href}
                                                        onClick={closeDrawer}
                                                        className="
                                                        group flex-1 rounded-2xl border border-slate-200/70 bg-white/85 px-3 py-2 
                                                        hover:bg-white
                                                        transition
                                                        "
                                                    >
                                                        <div className="flex items-start justify-between gap-2">
                                                        <div className="min-w-0">
                                                            <div className="truncate text-xs font-extrabold text-slate-900">
                                                            {gr.name}
                                                            </div>

                                                            {(gr.myNickname || gr.myMbti) && (
                                                            <div className="mt-0.5 truncate text-[11px] font-bold text-slate-500">
                                                                {gr.myNickname ?? "?"}
                                                                {gr.myMbti ? ` · ${gr.myMbti.toUpperCase()}` : ""}
                                                            </div>
                                                            )}
                                                        </div>

                                                        <span className="shrink-0 text-[11px] font-bold text-slate-400">
                                                        {formatRelativeTime(nowTs - gr.lastSeenAt)}
                                                        </span>
                                                        </div>
                                                    </Link>

                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                        removeSavedGroup(gr.id);
                                                        setGroups(readSavedGroups());
                                                        }}
                                                        className="
                                                        shrink-0 rounded-2xl border border-slate-200/70 bg-white/85 px-3 py-2
                                                        text-[11px] font-extrabold text-slate-500
                                                        hover:bg-white hover:text-slate-700
                                                        transition
                                                        "
                                                        aria-label="remove"
                                                        title="목록에서 삭제"
                                                    >
                                                        삭제
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

            {/* Bottom hint */}
            <div className="mt-auto pt-6">
              <div className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 text-xs leading-relaxed text-slate-600">
                <b className="text-slate-800">팁</b>· “모임 속 MBTI”에서 모임 유형별 케미 가이드를 한눈에 확인해보세요.
              </div>

              <div className="mt-3 text-[11px] font-semibold text-slate-400">
                © 2026 모임랭킹
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
