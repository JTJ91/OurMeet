import Link from "next/link";

import { listGuidesByGroup } from "../../_data/mbti/guides";
import { GROUP_META, type GroupType } from "../../_data/mbti/types";

const ORDER: GroupType[] = ["FRIENDS", "WORK", "LOCAL", "SPORTS", "GAMES"];

export default function MbtiGuidesPage() {
  const system = "mbti";

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mx-auto w-full max-w-3xl px-4 pb-16 pt-8">
        <div id="top" />

        {/* 뒤로가기 */}
        <div className="mb-4">
          <Link
            href="/mbti"
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-black/5"
          >
            ← 뒤로가기
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
            친구/회사/동네/운동/게임 같은 현실 모임에서
            <b> 어떤 조합에서 어떤 오해가 생기는지</b>부터 보시면 됩니다.
          </p>
        </header>

        {/* 상단 카테고리 */}
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
                    <div className="shrink-0 rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold text-slate-700">
                      바로보기 →
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* 가이드 목록 */}
        <section className="mt-8 space-y-10">
          {ORDER.map((k) => {
            const m = GROUP_META[k];
            const list = listGuidesByGroup(k);
            if (list.length === 0) return null;

            return (
              <section key={k} id={m.anchor} className="scroll-mt-24">
                <div className="mt-10">
                  <div className="mb-5 h-[2px] w-full bg-black/5" />
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.badge}</span>
                        <h2 className="text-2xl font-black tracking-tight">{m.label}</h2>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-600">
                          {list.length}개
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{m.desc}</p>
                    </div>

                    <a
                      href="#top"
                      className="rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5"
                    >
                      위로
                    </a>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {list.map((g) => (
                    <Link
                      key={g.slug}
                      id={g.slug}                 // ✅ 앵커 타겟을 Link(=a)에 직접
                      href={`/guides/${system}/${g.slug}`}
                      className="scroll-mt-24 rounded-3xl border border-black/5 bg-white/80 p-5 shadow-sm transition hover:bg-white"
                    >
                      <div className="flex items-start justify-between gap-3">  {/* ✅ items-start */}
                        <div>
                          <div className="text-lg font-black">{g.title}</div>
                          <p className="mt-2 text-sm text-slate-700">{g.description}</p>
                        </div>

                        <div className="shrink-0 self-start rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-extrabold text-slate-700">
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
