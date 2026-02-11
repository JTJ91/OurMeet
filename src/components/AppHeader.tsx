"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { readSavedGroups, removeSavedGroup, SavedGroup } from "@/lib/groupHistory";

type TreeItem =
  | { type: "link"; label: string; desc?: string; href: string }
  | { type: "action"; label: string; desc?: string; action: "recent" };

type TreeGroup = {
  key: "guide" | "moim";
  title: string;
  desc?: string;
  icon?: string;
  children: TreeItem[];
};

const TREE: TreeGroup[] = [
  {
    key: "guide",
    title: "가이드",
    desc: "개념/설명/FAQ 모아보기",
    icon: "📚",
    children: [
      { type: "link", label: "MBTI 인지기능", desc: "개념을 3분만에", href: "/cognitive-functions" },
      { type: "link", label: "모임 속 MBTI", desc: "친구/회사/동네/운동/게임", href: "/guides" },
      { type: "link", label: "FAQ", desc: "자주 묻는 질문", href: "/faq" },
    ],
  },
  {
    key: "moim",
    title: "모임",
    desc: "만들기 / 최근 모임",
    icon: "👥",
    children: [
      { type: "link", label: "모임 만들기", desc: "새 모임 생성", href: "/create" },
      { type: "action", label: "최근 모임", desc: "로컬 저장 목록", action: "recent" },
    ],
  },
];

function formatRelativeTime(ts: number) {
  const diff = Date.now() - ts;
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
    <div className="relative h-5 w-6">
      <span
        className={[
          "absolute left-0 top-0 h-[2px] w-6 rounded bg-slate-900 transition-all duration-300",
          open ? "top-[9px] rotate-45" : "",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[9px] h-[2px] w-6 rounded bg-slate-900 transition-all duration-300",
          open ? "opacity-0" : "opacity-100",
        ].join(" ")}
      />
      <span
        className={[
          "absolute left-0 top-[18px] h-[2px] w-6 rounded bg-slate-900 transition-all duration-300",
          open ? "top-[9px] -rotate-45" : "",
        ].join(" ")}
      />
    </div>
  );
}

export default function AppHeader() {
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const [openKey, setOpenKey] = useState<"guide" | "moim" | null>("guide");

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
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);

    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // ✅ drawer 열릴 때마다 최근 목록 로드
  useEffect(() => {
    if (open) setGroups(readSavedGroups());
  }, [open]);

  // ✅ 다른 탭에서 바뀐 경우도 반영
  useEffect(() => {
    const onStorage = () => setGroups(readSavedGroups());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // ✅ drawer 닫히면 하위 트리 정리
  useEffect(() => {
    if (!open) {
      setRecentOpen(false);
      setOpenKey(null);
    }
  }, [open]);

  const isActiveHref = (href: string) => {
    // 페이지가 /g/xxx 처럼 동적이면 startsWith가 유리할 때가 있어
    // 여기서는 정확 매칭 우선 + 필요시 startsWith로 확장 가능
    return pathname === href;
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-black/5 bg-white/70 backdrop-blur">
        <div className="mx-auto flex h-12 max-w-[760px] items-center justify-between px-5">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-sm font-extrabold tracking-tight text-slate-900">
              모임<span className="text-[#1E88E5]">랭킹</span>
            </span>
            <span className="hidden rounded-full bg-[#1E88E5]/10 px-2 py-0.5 text-[11px] font-extrabold text-[#1E88E5] sm:inline">
              beta
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="group inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/70 ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
            aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={open}
          >
            <MenuIcon open={open} />
          </button>
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
          onClick={() => setOpen(false)}
          className={[
            "absolute inset-0 transition-opacity duration-300",
            open ? "opacity-100 bg-black/35" : "opacity-0 bg-black/0",
          ].join(" ")}
        />

        <aside
          className={[
            "absolute right-0 top-0 h-full w-[320px] max-w-[85vw]",
            "bg-white/85 backdrop-blur-xl shadow-2xl ring-1 ring-black/5",
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
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white ring-1 ring-black/10 hover:bg-slate-50"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>

            {/* ✅ Tree Nav */}
            <nav className="mt-5">
              <div className="rounded-3xl bg-white/70 ring-1 ring-black/5 backdrop-blur">
                <ul className="divide-y divide-black/5">
                  {TREE.map((g) => {
                    const expanded = openKey === g.key;

                    return (
                      <li key={g.key}>
                        {/* Parent */}
                        <button
                          type="button"
                          onClick={() => setOpenKey((v) => (v === g.key ? null : g.key))}
                          className="
                            group flex w-full items-center gap-3 px-4 py-3 text-left
                            transition hover:bg-slate-900/5 active:bg-slate-900/[0.07]
                          "
                          aria-expanded={expanded}
                        >
                          <span
                            aria-hidden
                            className="
                              inline-flex h-9 w-9 items-center justify-center
                              rounded-2xl bg-slate-900/5 text-base
                              ring-1 ring-black/5 group-hover:bg-white
                            "
                          >
                            {g.icon ?? "•"}
                          </span>

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
                              {g.children.map((it) => {
                                // (A) 링크
                                if (it.type === "link") {
                                  const active = isActiveHref(it.href);

                                  return (
                                    <li key={it.href}>
                                      <Link
                                        href={it.href}
                                        onClick={() => setOpen(false)}
                                        className={[
                                          "group relative flex items-center px-6 py-2",
                                          "text-sm font-semibold transition",
                                          active
                                            ? "text-[#1E88E5] bg-[#1E88E5]/5"
                                            : "text-slate-700 hover:bg-slate-900/5",
                                        ].join(" ")}
                                      >
                                        {/* 왼쪽 인디케이터(미니멀) */}
                                        <span
                                          aria-hidden
                                          className={[
                                            "absolute left-4 top-1/2 h-4 w-[2px] -translate-y-1/2 rounded-full transition",
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
                                  <li key="recent">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setGroups(readSavedGroups());
                                        setRecentOpen((v) => !v);
                                      }}
                                      className={[
                                        "group relative flex w-full items-center px-6 py-2 text-left",
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
                                        <div className="mt-2 rounded-3xl bg-[#F5F9FF] p-3 ring-1 ring-black/5">
                                            {!groups.length ? (
                                            <div className="rounded-2xl bg-white/70 p-3 text-xs font-semibold text-slate-600 ring-1 ring-black/5">
                                                모임을 만들거나 참여하면 여기에 기록돼요
                                            </div>
                                            ) : (
                                            <ul className="space-y-2">
                                                {groups.map((gr) => {
                                                const href = gr.myMemberId
                                                    ? `/g/${gr.id}?center=${gr.myMemberId}`
                                                    : `/g/${gr.id}`;

                                                return (
                                                    <li key={gr.id} className="flex items-center gap-2">
                                                    <Link
                                                        href={href}
                                                        onClick={() => setOpen(false)}
                                                        className="
                                                        group flex-1 rounded-2xl bg-white/80 px-3 py-2
                                                        ring-1 ring-black/5
                                                        hover:bg-white hover:ring-black/10
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
                                                                내 정보: {gr.myNickname ?? "?"}
                                                                {gr.myMbti ? ` · ${gr.myMbti.toUpperCase()}` : ""}
                                                            </div>
                                                            )}
                                                        </div>

                                                        <span className="shrink-0 text-[11px] font-bold text-slate-400">
                                                        {formatRelativeTime(gr.lastSeenAt)}
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
                                                        shrink-0 rounded-2xl bg-white/70 px-3 py-2
                                                        text-[11px] font-extrabold text-slate-500
                                                        ring-1 ring-black/10
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

                                            {/* ✅ footnote */}
                                            <div className="mt-3 rounded-2xl bg-white/60 p-3 text-[11px] font-semibold text-slate-500 ring-1 ring-black/5">
                                            ※ 이 목록은 이 기기(브라우저)에만 저장돼요.
                                            </div>
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
              <div className="rounded-2xl bg-[#F5F9FF] p-4 text-xs leading-relaxed text-slate-600 ring-1 ring-black/5">
                <b className="text-slate-800">팁</b> · “모임 속 MBTI”에서 친구/회사/동네 모임별로 바로 찾아볼 수 있어요.
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
