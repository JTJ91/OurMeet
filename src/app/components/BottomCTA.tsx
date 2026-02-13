"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readSavedGroups, removeSavedGroup, SavedGroup } from "@/app/lib/mbti/groupHistory";

export default function BottomCTA({ desktopSticky = false }: { desktopSticky?: boolean }) {
  const [isScrolling, setIsScrolling] = useState(false);
  const [nowTs, setNowTs] = useState(() => Date.now());

  const [groups, setGroups] = useState<SavedGroup[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);  //네비게이션 메뉴 

  function formatRelativeTime(ts: number, now: number) {
    const diff = now - ts;
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

  useEffect(() => {
    const onMenu = (e: Event) => {
      const ce = e as CustomEvent<{ open: boolean }>;
      setMenuOpen(!!ce.detail?.open);

      // ✅ 메뉴 열리면 CTA의 바텀시트도 같이 닫아버리기(겹침 방지)
      if (ce.detail?.open) setSheetOpen(false);
    };

    window.addEventListener("app:menu", onMenu as EventListener);
    return () => window.removeEventListener("app:menu", onMenu as EventListener);
  }, []);


  useEffect(() => {
    let timeout: NodeJS.Timeout;

    const handleScroll = () => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolling(false), 150);
    };

    const load = () => setGroups(readSavedGroups());
    load();

    // 다른 탭에서 바뀐 경우 반영
    window.addEventListener("storage", load);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("storage", load);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => setNowTs(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const hasAny = groups.length > 0;

  const subtitle = useMemo(() => {
    if (!hasAny) return "최근 참여한 모임이 없어요";
    return `최근 참여한 모임 ${groups.length}개`;
  }, [hasAny, groups.length]);

    return (
    <div
      data-bottom-cta
      className={[
        desktopSticky
          ? "fixed inset-x-0 bottom-0 z-50"
          : "fixed inset-x-0 bottom-0 z-50 sm:static sm:z-auto sm:mt-10",
        menuOpen ? "hidden" : "",
      ].join(" ")}
    >
      <div className="mbti-card-frame px-5 pb-5 sm:pb-0">
        <div
          className={[
            "rounded-3xl border border-slate-200/70 bg-white/88 p-3",
            "backdrop-blur-sm shadow-[0_12px_34px_rgba(15,23,42,0.12)]",
            "transition-all duration-200 ease-out",
            isScrolling ? "scale-95 opacity-90" : "scale-100 opacity-100",
            desktopSticky ? "" : "sm:scale-100 sm:opacity-100 sm:bg-transparent sm:shadow-none sm:ring-0 sm:p-0",
          ].join(" ")}
        >
          <div className="grid grid-cols-2 items-stretch gap-3">
            {/* 모임 만들기 */}
            <Link href="/mbti/create" className="block">
              <button
                type="button"
                className="mbti-primary-btn relative flex h-14 w-full items-center justify-center rounded-2xl px-4 text-sm font-extrabold text-white transition-all duration-200 active:scale-[0.98]"
              >
                <span className="inline-flex items-center gap-2 whitespace-nowrap">
                  <span aria-hidden>✨</span>
                  <span>모임 만들기</span>
                </span>
              </button>
            </Link>

            {/* 최근 모임 */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="relative flex h-14 w-full items-center rounded-2xl border border-slate-200/70 bg-white/88 px-4 text-left shadow-[0_6px_14px_rgba(15,23,42,0.06)] transition-all duration-200 hover:bg-white active:scale-[0.98]"
            >
              <div className="min-w-0">
                <div className="text-sm font-extrabold text-[#1E88E5]">
                  최근 모임
                </div>
                <div className="truncate text-xs font-semibold text-slate-500">
                  {subtitle}
                </div>
              </div>

              <div className="ml-auto text-lg font-extrabold text-[#1E88E5]/60">
                ›
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 바텀시트 */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-[60]"
          role="dialog"
          aria-modal="true"
        >
          {/* dim */}
          <button
            aria-label="close"
            className="absolute inset-0 bg-black/30"
            onClick={() => setSheetOpen(false)}
          />

          {/* sheet */}
          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[420px] px-5 pb-5">
            <div className="rounded-3xl border border-slate-200/70 bg-white/95 p-4 shadow-[0_18px_40px_rgba(15,23,42,0.18)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-extrabold text-slate-900">
                    최근 참여한 모임
                  </div>
                  <div className="mt-1 text-xs font-semibold text-slate-500">
                    {hasAny ? "탭하면 해당 모임으로 이동해요" : "아직 저장된 모임이 없어요"}
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-xl px-3 py-2 text-xs font-extrabold text-slate-500 hover:bg-slate-100"
                  onClick={() => setSheetOpen(false)}
                >
                  닫기
                </button>
              </div>

              <div className="mt-4">
                {!hasAny ? (
                  <div className="rounded-2xl border border-slate-200/70 bg-white/90 p-4 text-sm text-slate-600">
                    모임을 만들거나 참여하면 여기에 기록돼요
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {groups.map((g) => {
                      const href = g.myMemberId
                        ? `/mbti/g/${g.id}?center=${g.myMemberId}`
                        : `/mbti/g/${g.id}`;

                      return (
                        <li key={g.id} className="flex items-center gap-2">
                          <Link
                            href={href}
                            className="block w-full rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 hover:bg-white"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-extrabold text-slate-800">
                                  {g.name}
                                </div>

                                {/* (선택) 내 정보 표시 */}
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

                {/* 안내 */}
                <section className="mt-4">
                  <div className="rounded-3xl border border-slate-200/70 bg-white/88 p-5">
                    <p className="text-xs leading-relaxed text-slate-500">
                      ※ 이 목록은 이 기기(브라우저)에만 저장돼요. 시크릿모드/브라우저
                      초기화 시 사라질 수 있어요.
                    </p>
                  </div>
                </section>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

