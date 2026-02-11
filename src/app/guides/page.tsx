// app/guides/page.tsx
import Link from "next/link";
import { GUIDES, listGuidesByGroup } from "./_data/guides";
import { GROUP_META, type GroupType } from "./_data/types";

const ORDER: GroupType[] = ["FRIENDS", "WORK", "LOCAL", "SPORTS", "GAMES"];

export const metadata = {
  title: "가이드 | 모임랭크",
  description: "친구/회사/동네/운동/게임 모임에서 MBTI로 생기는 케미와 문제 상황을 쉽게 정리한 가이드",
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-10">
        {/* id=top용 앵커 */}
        <div id="top" />
        
        {/* 좌측 상단 메인으로 버튼 */}
        <div className="mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-black/5 backdrop-blur transition hover:bg-white"
          >
            <span aria-hidden>←</span>
            <span>메인으로</span>
          </Link>
        </div>
  
        {/* 헤더 */}
        <header className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
          <h1 className="mt-2 text-2xl font-black leading-tight">
            모임에서 <span className="text-slate-600">자주 터지는 순간</span>을
            <br />
            MBTI로 <span className="text-slate-600">쉽게</span> 정리했어요
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            어렵게 “인지기능”부터 시작하지 않을게요. <b>친구/회사/동네/운동/게임</b> 같은 현실 모임에서
            <b> 어떤 조합에서 어떤 오해가 생기는지</b>부터 보시면 됩니다.
          </p>
        </header>

        {/* 상단: 모임 종류 카드 (바로보기 = 아래 섹션으로 스크롤) */}
        <section className="mt-6">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ORDER.map((k) => {
              const m = GROUP_META[k];
              return (
                <a
                  key={k}
                  href={`#${m.anchor}`}
                  className="group rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm transition hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.badge}</span>
                        <div className="text-base font-black">{m.label}</div>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">{m.desc}</div>
                    </div>

                    <div className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold text-slate-700 transition group-hover:border-black/20">
                      바로보기 →
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* 아래: 각 모임 섹션별 가이드 목록 */}
        <section className="mt-8 space-y-10">
          {ORDER.map((k) => {
            const m = GROUP_META[k];
            const list = listGuidesByGroup(k);

            // 아직 가이드 없으면 섹션은 숨기고 싶으면 여기서 return null 해도 됨
            if (list.length === 0) return null;

            return (
              <section
                key={k}
                id={m.anchor}
                className="scroll-mt-24"
                aria-label={`${m.label} 섹션`}
              >
                {/* ✅ 섹션 헤더 (카드 X, 굵은 텍스트 + 구분선) */}
                <div className="mt-10">
                  {/* 섹션 시작 구분선(굵게) */}
                  <div className="mb-5 h-[2px] w-full bg-black/5" />

                  <div className="flex items-end justify-between gap-3">
                    <div className="min-w-0">
                      {/* 타이틀 라인 */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xl">{m.badge}</span>
                        <h2 className="text-2xl font-black tracking-tight">{m.label}</h2>

                        <span className="ml-1 inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600">
                          {list.length}개
                        </span>
                      </div>

                      {/* 설명 */}
                      <p className="mt-2 max-w-[46ch] text-sm leading-6 text-slate-600">
                        {m.desc}
                      </p>
                    </div>

                    <a
                      href="#top"
                      className="shrink-0 rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 hover:bg-white"
                    >
                      위로
                    </a>
                  </div>

                </div>


                {/* ✅ 카드 리스트 */}
                <div className="mt-4 grid grid-cols-1 gap-3">
                  {list.map((g) => (
                    <Link
                      key={g.slug}
                      id={g.slug}
                      href={`/guides/${g.slug}`}
                      className="scroll-mt-28 rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm transition hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-lg font-black leading-snug">{g.title}</div>
                          <p className="mt-2 text-sm leading-7 text-slate-700">{g.description}</p>
                        </div>
                        <div className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold text-slate-700">
                          읽기 →
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            );



          })}
        </section>

      </div>
    </main>
  );
}
