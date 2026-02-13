"use client";

import { useCallback, useMemo, useState } from "react";
import EgoGraphCanvasResponsive, { EgoNode } from "@/app/components/mbti/EgoGraphCanvasResponsive";
import { calcCompatLevel, calcCompatScore } from "@/app/lib/mbti/mbtiCompat";
import BottomCTA from "@/app/components/BottomCTA";
import Link from "next/link";

const MEMBERS = [
  { id: "1", name: "태주", mbti: "ESTP" },
  { id: "2", name: "민서", mbti: "ESTJ" },
  { id: "3", name: "서연", mbti: "ENTJ" },
  { id: "4", name: "현우", mbti: "ESFJ" },
  { id: "5", name: "지윤", mbti: "ENTJ" },
  { id: "6", name: "도윤", mbti: "ISTP" },
  { id: "7", name: "지민", mbti: "ISFP" },
  { id: "8", name: "유진", mbti: "INTP" },
  { id: "9", name: "수아", mbti: "ENFJ" },
  { id: "10", name: "하나", mbti: "ENTP" },
  { id: "11", name: "채원", mbti: "ENFP" },
  { id: "12", name: "준호", mbti: "ISTJ" },
  { id: "13", name: "예린", mbti: "ESFP" },
] as const;

export default function Home() {
  const members = MEMBERS;

  const initialCenterId = members[0].id;
  const [centerId, setCenterId] = useState<string>(initialCenterId);

  const membersById = useMemo(() => {
    const m = new Map<string, (typeof members)[number]>();
    for (const item of members) m.set(item.id, item);
    return m;
  }, [members]);

  const center = useMemo(() => {
    return membersById.get(centerId) ?? members[0];
  }, [centerId, membersById, members]);

  const handleCenterChange = useCallback((id: string) => {
    setCenterId(id);
  }, []);

  const compatCache = useMemo(() => new Map<string, { score: number; level: 1 | 2 | 3 | 4 | 5 }>(), []);

  const otherNodes: EgoNode[] = useMemo(() => {
    const cMbti = center.mbti;

    return members
      .filter((m) => m.id !== centerId)
      .map((m) => {
        const key = `${cMbti}__${m.mbti}`;
        const cached = compatCache.get(key);
        if (cached) {
          return { id: m.id, name: m.name, mbti: m.mbti, score: cached.score, level: cached.level };
        }

        const score = calcCompatScore(cMbti, m.mbti);
        const level = calcCompatLevel(cMbti, m.mbti) as 1 | 2 | 3 | 4 | 5;
        compatCache.set(key, { score, level });

        return { id: m.id, name: m.name, mbti: m.mbti, score, level };
      });
  }, [members, centerId, center.mbti, compatCache]);

  return (
    <main className="mbti-page-bg pb-10">
      <div className="mbti-shell flex min-h-screen flex-col">
        <div className="flex items-center justify-between">
          <Link href="/" className="mbti-back-btn">
            <span aria-hidden>←</span>
            <span>메인으로</span>
          </Link>
        </div>

        <section className="mt-4">
          <div className="mbti-card p-6">
            <h1 className="text-3xl font-extrabold leading-tight">
              우리 모임
              <br />
              <span className="underline decoration-[#FDD835]/70">누가 누구랑 잘 맞을까?</span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              <b className="text-[#1E88E5]">MBTI 인지기능</b>을 기반으로
              <br />
              서로의 <b className="text-slate-800">생각 방식과 대화 리듬</b>을 비교해 관계 케미를 확인해요.
            </p>

            <Link
              href="/mbti/cognitive-functions"
              className="mt-3 inline-block text-xs font-bold text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700"
            >
              MBTI 인지기능이란?
            </Link>
          </div>
        </section>

        <section className="mt-10">
          <div className="mbti-card mx-auto w-full max-w-[400px] overflow-hidden md:max-w-[640px] lg:max-w-[760px]">
            <EgoGraphCanvasResponsive
              centerName={center.name}
              centerSub={center.mbti}
              nodes={otherNodes}
              ringCount={3}
              maxSize={760}
              minSize={300}
              aspect={1}
              onCenterChange={handleCenterChange}
            />
          </div>
        </section>

        <section className="mt-5">
          <div className="mbti-card p-4">
            <div className="mb-3 text-xs font-extrabold text-slate-500">빠른 시작</div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Link
                href="/mbti-test"
                className="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white"
              >
                MBTI 검사
                <div className="mt-0.5 text-[11px] font-semibold text-slate-500">정식 60문항 검사</div>
              </Link>

              <Link
                href="/guides/mbti"
                className="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white"
              >
                모임 속 MBTI
                <div className="mt-0.5 text-[11px] font-semibold text-slate-500">상황별 케미 가이드</div>
              </Link>

              <Link
                href="/mbti/cognitive-functions"
                className="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white"
              >
                이용 가이드
                <div className="mt-0.5 text-[11px] font-semibold text-slate-500">점수 계산 방식 안내</div>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <BottomCTA />
    </main>
  );
}
