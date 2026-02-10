"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readSavedGroups, removeSavedGroup, SavedGroup } from "@/lib/groupHistory";

export default function BottomCTA() {
  const [isScrolling, setIsScrolling] = useState(false);

  const [groups, setGroups] = useState<SavedGroup[]>([]);
  const [sheetOpen, setSheetOpen] = useState(false);

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

  const hasAny = groups.length > 0;

  const subtitle = useMemo(() => {
    if (!hasAny) return "최근 참여한 모임이 없어요";
    return `최근 참여한 모임 ${groups.length}개`;
  }, [hasAny, groups.length]);

    return (
    <div className="fixed inset-x-0 bottom-0 z-50 sm:static sm:z-auto sm:mt-10">
      <div className="mx-auto max-w-[420px] px-5 pb-5 sm:pb-0">
        <div
          className={`
            rounded-3xl bg-white/80 p-3 ring-1 ring-black/5
            backdrop-blur-md shadow-[0_12px_40px_rgba(0,0,0,0.12)]
            transition-all duration-200 ease-out
            ${isScrolling ? "scale-95 opacity-90" : "scale-100 opacity-100"}
            sm:scale-100 sm:opacity-100 sm:bg-transparent sm:shadow-none sm:ring-0 sm:p-0
          `}
        >
          <div className="grid grid-cols-2 items-stretch gap-3">
            {/* 모임 만들기 */}
            <Link href="/create" className="block">
              <button
                type="button"
                className="relative flex h-14 w-full items-center justify-center rounded-2xl bg-[#1E88E5] px-4 text-sm font-extrabold text-white transition-all duration-200 hover:bg-[#1E88E5]/90 active:scale-[0.98]"
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
              className="relative flex h-14 w-full items-center rounded-2xl bg-white px-4 text-left ring-1 ring-[#1E88E5]/30 transition-all duration-200 hover:bg-[#1E88E5]/5 active:scale-[0.98]"
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
            <div className="rounded-3xl bg-white p-4 shadow-xl ring-1 ring-black/10">
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
                  <div className="rounded-2xl bg-[#F5F9FF] p-4 text-sm text-slate-600">
                    모임을 만들거나 참여하면 여기에 기록돼요
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {groups.map((g) => {
                      console.log(g);
                      const href = g.myMemberId ? `/g/${g.id}?center=${g.myMemberId}` : `/g/${g.id}`;

                      return (
                        <li key={g.id} className="flex items-center gap-2">
                          <Link
                            href={href}
                            className="block w-full rounded-2xl bg-[#F5F9FF] px-4 py-3 ring-1 ring-black/5 hover:bg-[#EEF6FF]"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="truncate text-sm font-extrabold text-slate-800">
                                  {g.name}
                                </div>

                                {/* (선택) 내 정보 표시 */}
                                {(g.myNickname || g.myMbti) && (
                                  <div className="mt-1 truncate text-[11px] font-bold text-slate-500">
                                    내 정보: {g.myNickname ?? "?"}
                                    {g.myMbti ? ` · ${g.myMbti.toUpperCase()}` : ""}
                                  </div>
                                )}
                              </div>

                              <div className="shrink-0 text-[11px] font-bold text-slate-500">
                                {formatRelativeTime(g.lastSeenAt)}
                              </div>
                            </div>
                          </Link>

                          <button
                            type="button"
                            onClick={() => {
                              removeSavedGroup(g.id);
                              setGroups(readSavedGroups());
                            }}
                            className="shrink-0 rounded-2xl bg-white px-3 py-3 text-xs font-extrabold text-slate-500 ring-1 ring-black/10 hover:bg-slate-50"
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
                  <div className="rounded-3xl bg-white/70 p-5 ring-1 ring-black/5">
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

