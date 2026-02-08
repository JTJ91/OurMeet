import EgoGraphCanvasResponsive, { EgoNode } from "@/components/EgoGraphCanvasResponsive";
import BottomCTA from "@/components/BottomCTA";

import Link from "next/link";

const sample: EgoNode[] = [
  { id: "1", name: "지수", mbti: "ENFP", level: 5 },
  { id: "2", name: "서안", mbti: "ESTP", level: 5 },
  { id: "3", name: "하린", mbti: "INFJ", level: 4 },
  { id: "4", name: "도윤", mbti: "ENTJ", level: 4 },
  { id: "5", name: "수아", mbti: "ISFP", level: 4 },
  { id: "6", name: "현우", mbti: "INTP", level: 3 },
  { id: "7", name: "유진", mbti: "ESFJ", level: 3 },
  { id: "8", name: "나영", mbti: "ISTJ", level: 3 },
  { id: "9", name: "다혜", mbti: "INFP", level: 3 },
  { id: "10", name: "둘리", mbti: "ENTP", level: 3 },
  { id: "11", name: "또치", mbti: "ISFJ", level: 2 },
  { id: "12", name: "도우", mbti: "ESTJ", level: 2 },
  { id: "13", name: "기현", mbti: "INTJ", level: 2 },
  { id: "14", name: "세아", mbti: "ENFJ", level: 2 },
  { id: "15", name: "수현", mbti: "ISTP", level: 2 },
  { id: "16", name: "진아", mbti: "ESFP", level: 2 },
  { id: "17", name: "덕칠", mbti: "ISTP", level: 1 },
  { id: "18", name: "유미", mbti: "ENFP", level: 5 },
  { id: "19", name: "원호", mbti: "INTJ", level: 1 },
  { id: "20", name: "대겸", mbti: "ESTJ", level: 1 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900 pb-36">
      {/* Centered "mobile-like" container */}
      <div className="mx-auto flex min-h-screen max-w-[760px] flex-col px-5 pt-8">
        {/* Header */}
        <header className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            모임<span className="text-[#1E88E5]">랭킹</span>
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            모임 안에서 <b className="text-[#1E88E5]">MBTI 인지기능</b>을 활용해 <br/>서로의 관계 케미를 재미로 살펴봐요
          </p>

          <br/>
          <p>
            <Link href="/guide/cognitive-functions" className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-700">
              MBTI 인지기능이란?
            </Link>
          </p>
        </header>

        {/* Hero */}
        <section className="mt-10">
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
          </div>
        </section>

        <section className="mt-10">
          <div className="mx-auto w-full max-w-[400px] md:max-w-[640px] lg:max-w-[760px] rounded-3xl bg-white/70 shadow-sm ring-1 ring-black/5 overflow-hidden">
            <EgoGraphCanvasResponsive centerName="태주" centerSub="ESTP" nodes={sample} ringCount={3} maxSize={760} minSize={300} aspect={1} />
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
                  <b className="text-slate-800">모임 생성</b> 후 초대 링크를 공유해요
                </span>
              </li>

              <li className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FDD835]/30 text-xs font-bold text-slate-800">
                  2
                </span>
                <span className="leading-6">
                  멤버들이 <b className="text-slate-800">MBTI</b>를 입력해요
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

      <footer className="border-black/5 py-10 text-center text-xs text-slate-500">
        <div className="space-x-3">
          <a href="/faq" className="hover:text-slate-700 transition">
            자주 묻는 질문
          </a>
          <span className="text-slate-300">·</span>
          <a href="/terms" className="hover:text-slate-700 transition">
            이용약관
          </a>
          <span className="text-slate-300">·</span>
          <a href="/privacy" className="hover:text-slate-700 transition">
            개인정보처리방침
          </a>
        </div>

        <div className="mt-4 text-[11px] text-slate-400">
          © 2026 모임랭크. All rights reserved.
        </div>
      </footer>

    </main>
  );
}
