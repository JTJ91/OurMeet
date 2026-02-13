// app/mbti-test/page.tsx
import Link from "next/link";
import MbtiTestClient from "./MbtiTestClient";

export const metadata = {
  title: "MBTI 정식 검사 | 모임랭킹",
  description: "60문항으로 MBTI를 더 정확하게 확인해보세요.",
};

export default function MbtiTestPage() {
  return (
    <main className="mbti-page-bg">
      <div className="mbti-shell w-full max-w-[820px] pb-16 pt-10">
        {/* Top bar */}
        <div className="mb-4 flex items-center justify-between">
        <Link
            href="/mbti"
            className="mbti-back-btn"
        >
            <span aria-hidden>←</span>
            <span>MBTI 홈</span>
        </Link>
        </div>


        {/* Header */}
        <header className="mbti-card p-6">
        <h1 className="text-3xl font-extrabold leading-tight text-slate-900">
            MBTI 정식 검사
            <br />
            <span className="underline decoration-[#FDD835]/70 underline-offset-4">
            60문항으로 더 정확하게
            </span>
        </h1>

        <p className="mt-3 text-sm leading-relaxed text-slate-600">
            <b className="text-[#1E88E5]">인지기능 기반</b>으로
            <br />
            당신의 <b className="text-slate-800">에너지 방향과 판단 방식</b>을 분석해
            더 정밀한 MBTI 결과를 확인해요.
        </p>

        <Link
            href="/mbti/create"
            className="mt-3 inline-block text-xs font-bold text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700"
        >
            간단 검사는 여기에서 →
        </Link>
        </header>



        {/* Test Card */}
        <section className="mbti-card mt-5 p-5">
          <MbtiTestClient />
        </section>

        {/* Footer hint */}
        <div className="mt-6 text-center text-[11px] font-bold text-slate-500">
          ※ MBTI는 참고용이며, 상황·경험에 따라 결과가 달라질 수 있습니다.
        </div>
      </div>
    </main>
  );
}
