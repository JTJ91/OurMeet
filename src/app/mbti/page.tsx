"use client";

import EgoGraphCanvasResponsive, { EgoNode } from "@/app/components/mbti/EgoGraphCanvasResponsive";
import { calcCompatLevel, calcCompatScore } from "@/app/lib/mbti/mbtiCompat";
import BottomCTA from "@/app/components/BottomCTA";
import ClientOverlays from "@/app/components/ClientOverlays";
import { useMemo, useState } from "react";
import Link from "next/link";


export default function Home() {
  const members = [
  // 🎯 센터
  { id: "1", name: "태주", mbti: "ESTP" },

  // ⭐ 5단계 (1명)
  { id: "2", name: "민준", mbti: "ESTJ" },

  // 🟢 4단계 (3명)
  { id: "3", name: "서연", mbti: "ENTJ" },
  { id: "4", name: "현우", mbti: "ESFJ" },
  { id: "5", name: "지우", mbti: "ENTJ" },

  // 🟡 3단계 (4명)
  { id: "6", name: "서준", mbti: "ISTP" },
  { id: "7", name: "지민", mbti: "ISFP" },
  { id: "8", name: "하준", mbti: "INTP" },
  { id: "9", name: "수아", mbti: "ENFJ" },

  // 🟠 2단계 (3명)
  { id: "10", name: "유나", mbti: "ENTP" },
  { id: "11", name: "채원", mbti: "ENFP" },
  { id: "12", name: "준호", mbti: "ISTJ" },

  // 🔴 1단계 (1명)
  { id: "13", name: "예은", mbti: "ESFP" },
];




  const initialCenterId = members[0].id;
  const [centerId, setCenterId] = useState<string>(initialCenterId);

  const center = useMemo(
    () => members.find((m) => m.id === centerId) ?? members[0],
    [centerId]
  );

  const otherNodes: EgoNode[] = useMemo(() => {
    return members
      .filter((m) => m.id !== centerId)
      .map((m) => ({
        id: m.id,
        name: m.name,
        mbti: m.mbti,
        score: calcCompatScore(center.mbti, m.mbti),
        level: calcCompatLevel(center.mbti, m.mbti),
      }));
  }, [centerId, center.mbti]);


  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900 pb-10">
      {/* Centered "mobile-like" container */}
      <div className="mx-auto flex min-h-screen max-w-[760px] flex-col px-5 pt-8">

        {/* Top left back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <span aria-hidden>←</span>
            <span>메인으로</span>
          </Link>
        </div>

        {/* Hero */}
        <section className="mt-4">
          <div className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
            <h1 className="text-3xl font-extrabold leading-tight">
              우리 모임<br />
              <span className="underline decoration-[#FDD835]/70">
                누가 제일 잘 맞을까?
              </span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              <b className="text-[#1E88E5]">MBTI 인지기능</b>을 바탕으로<br />
              서로의 <b className="text-slate-800">생각 방식과 대화 리듬</b>을 비교해
              관계 케미를 확인해요.
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
          <div className="mx-auto w-full max-w-[400px] md:max-w-[640px] lg:max-w-[760px] rounded-3xl bg-white/70 shadow-sm ring-1 ring-black/5 overflow-hidden">
            <EgoGraphCanvasResponsive
              centerName={center.name}
              centerSub={center.mbti}
              nodes={otherNodes}
              ringCount={3}
              maxSize={760}
              minSize={300}
              aspect={1}
              onCenterChange={(id) => setCenterId(id)}
            />
          </div>
        </section>

        {/* MBTI Quick Actions */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/80 p-4 ring-1 ring-black/5 shadow-sm">
            <div className="mb-3 text-sm font-bold text-slate-800">
              MBTI가 아직 없다면?
            </div>

            <div className="grid grid-cols-2 gap-3">

              {/* 정식 검사 */}
              <Link href="/mbti-test" className="block">
                <div className="
                  flex h-14 flex-col items-start justify-center
                  rounded-2xl bg-[#1E88E5] px-4 text-white
                  transition hover:brightness-110 active:scale-[0.98]
                ">
                  <div className="text-sm font-extrabold">
                    MBTI 검사
                  </div>
                  <div className="text-[11px] font-semibold text-white/80">
                    60문항 정식 테스트
                  </div>
                </div>
              </Link>

              {/* 가이드 */}
              <Link href="/guides/mbti" className="block">
                <div className="
                  flex h-14 flex-col items-start justify-center
                  rounded-2xl bg-[#F5F9FF] px-4
                  text-[#1E88E5] ring-1 ring-[#1E88E5]/20
                  transition hover:bg-[#E9F2FF] active:scale-[0.98]
                ">
                  <div className="text-sm font-extrabold">
                    모임 속 MBTI
                  </div>
                  <div className="text-[11px] font-semibold text-[#1E88E5]/70">
                    인지기능 & 케미 설명
                  </div>
                </div>
              </Link>

            </div>
          </div>
        </section>



        {/* Steps */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <div className="text-sm font-bold text-slate-800">사용 방법</div>

            <ul className="mt-4 space-y-4 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDD835]/30 text-xs font-bold text-slate-800">
                  1
                </span>
                <span className="leading-6">
                  <b className="text-slate-800">모임 만들기</b> 후 초대 링크를 공유해요
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDD835]/30 text-xs font-bold text-slate-800">
                  2
                </span>
                <span className="leading-6">
                  멤버들이 <b className="text-slate-800">별명, MBTI</b>를 입력해요
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDD835]/30 text-xs font-bold text-slate-800">
                  3
                </span>
                <span className="leading-6">
                  관계 궁합을 <b className="text-slate-800">단계별</b>로 보고, 케미 랭킹도 확인해요
                </span>
              </li>
            </ul>
          </div>
        </section>


        {/* Trust/Note */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-5 ring-1 ring-black/5">
            <p className="text-xs leading-relaxed text-slate-500">
              ※ 결과는 재미를 위한 참고용이에요. 관계 판단/결정의 근거로 사용하지 마세요.
            </p>
          </div>
        </section>
      </div>

      <BottomCTA />
      
    </main>
  );
}

