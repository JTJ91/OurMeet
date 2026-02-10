import Link from "next/link";
import { GUIDES } from "./_data/guides";

export const metadata = {
  title: "가이드 | 모임랭크",
  description: "MBTI 인지기능 기반 모임 케미/팀워크 가이드 모음",
};

export default function GuidesIndexPage() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
        <div className="mb-4 flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <span aria-hidden>←</span>
            <span>메인으로</span>
          </Link>
        </div>

        <header className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <div className="text-xs font-bold uppercase tracking-wider text-[#1E88E5]">
            MOIM RANK GUIDE
          </div>

          <h1 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
            모임을 더 잘 굴리는 방법
          </h1>

          <p className="mt-4 text-sm leading-7 text-slate-700">
            MBTI 인지기능 기반으로
            <b className="text-slate-900"> 케미, 역할 분담, 갈등 구조</b>를
            실전 운영 관점에서 정리했어요.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">#케미분석</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">#팀워크운영</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">#인지기능</span>
          </div>
        </header>


        <section className="mt-8 grid gap-3">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="group rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm transition hover:bg-white"
            >
              <div className="text-sm font-extrabold text-slate-900 group-hover:text-[#1E88E5]">
                {g.title}
              </div>
              <div className="mt-2 text-sm leading-7 text-slate-700">{g.description}</div>
              <div className="mt-3 text-xs font-bold text-slate-400">자세히 보기 →</div>
            </Link>
          ))}
        </section>

        {/* CTA */}
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <a
              href="/"
              className="flex-1 rounded-full border border-slate-300 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              메인으로
            </a>
            <a
              href="/create"
              className="flex-1 rounded-full bg-[#1E88E5] px-6 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-[#1E88E5]/90"
            >
              우리 모임 케미 보러가기 →
            </a>
          </div>
      </div>
    </main>
  );
}
