import EgoGraphCanvas, { EgoNode } from "@/components/EgoGraphCanvas";

const sample: EgoNode[] = [
  { id: "1", name: "태주", level: 4 },
  { id: "2", name: "서안", level: 4 },
  { id: "3", name: "하린", level: 4 },
  { id: "4", name: "도윤", level: 3 },
  { id: "5", name: "수아", level: 3 },
  { id: "6", name: "현우", level: 3 },
  { id: "7", name: "유진", level: 2 },
  { id: "8", name: "나영", level: 2 },
  { id: "9", name: "지훈", level: 1 },
  { id: "10", name: "다혜", level: 1 },
  { id: "11", name: "준호", level: 1 },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-pink-50 via-sky-50 to-emerald-50 text-slate-900">
      {/* Centered "mobile-like" container */}
      <div className="mx-auto flex min-h-screen max-w-[420px] flex-col px-5 pt-8 pb-28">
        {/* Header */}
        <header className="text-center">
          <div className="inline-flex items-center justify-center rounded-2xl bg-white/70 px-4 py-2 shadow-sm ring-1 ring-black/5">
            <span className="text-2xl font-extrabold tracking-tight">모임랭킹</span>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            모임 안에서 서로의 <b className="text-slate-800">관계 케미</b>를 재미로 확인해요
          </p>
        </header>

        {/* Hero */}
        <section className="mt-10">
          <div className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
            <h1 className="text-3xl font-extrabold leading-tight">
              우리 모임<br/> <span className="underline decoration-yellow-300/70">누가 제일 잘 맞을까?</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              지금은 <b className="text-slate-800">MBTI</b>로 시작해요.
              <br />
              앞으로 사주 등 다른 기준도 추가할 예정이에요.
              <span className="text-slate-500"> (재미로만 🙂)</span>
            </p>

            {/* Mini badges */}
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                MBTI
              </span>
              <span className="rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700">
                관계 단계
              </span>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                모임별 참여
              </span>
            </div>
          </div>
        </section>

        <div style={{ padding: 24, display: "grid", placeItems: "center" }}>
          <EgoGraphCanvas centerName="민지" centerSub="ENFP" nodes={sample} size={380} ringCount={3} />
        </div>

        {/* Steps */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <div className="text-sm font-bold text-slate-800">사용 방법</div>
            <ul className="mt-3 space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-xs font-bold text-slate-700">
                  1
                </span>
                <span>
                  <b className="text-slate-800">모임 생성</b> 후 초대 링크를 공유해요
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-xs font-bold text-slate-700">
                  2
                </span>
                <span>
                  멤버들이 <b className="text-slate-800">MBTI</b>를 입력해요
                </span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900/5 text-xs font-bold text-slate-700">
                  3
                </span>
                <span>
                  관계 궁합을 <b className="text-slate-800">단계별</b>로 보고, 케미 랭킹도 확인해요
                </span>
              </li>
            </ul>
          </div>
        </section>

        {/* Trust/Note */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/60 p-5 ring-1 ring-black/5">
            <p className="text-xs leading-relaxed text-slate-500">
              ※ 결과는 재미를 위한 참고용이에요. 관계 판단/결정의 근거로 사용하지 마세요.
            </p>
          </div>
        </section>
      </div>

      {/* Sticky bottom CTA (follows scroll) */}
      <div className="fixed inset-x-0 bottom-0 z-50">
        {/* Blur backdrop */}
        <div className="mx-auto max-w-[420px] px-5 pb-5">
          <div className="rounded-3xl bg-white/75 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur">
            <div className="grid grid-cols-2 gap-3">
              <button className="w-full rounded-2xl bg-yellow-300 px-4 py-4 text-sm font-extrabold text-slate-900 active:scale-[0.99]">
                모임 생성하기
              </button>
              <button className="w-full rounded-2xl bg-slate-900/10 px-4 py-4 text-sm font-bold text-slate-900 ring-1 ring-black/5 active:scale-[0.99]">
                모임 참가하기
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
