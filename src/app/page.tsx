import Link from "next/link";

export const metadata = {
  title: "모임랭킹",
  description:
    "우리 모임 케미를 재밌게 랭킹으로 정리해보세요. 대화 흐름·결정 스타일·역할 분담까지 한 번에.",
};

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900">
      <div className="mbti-shell flex min-h-screen flex-col items-center justify-center px-6 py-20 text-center">

        <div className="relative text-4xl font-black tracking-tight sm:text-5xl">
          <span>
            모임<span className="text-[#1E88E5]">랭킹</span>
          </span>

          <span className="
            absolute -right-12 -top-2
            rounded-full bg-[#1E88E5]/10
            px-2 py-0.5
            text-[11px] font-extrabold
            text-[#1E88E5]
          ">
            beta
          </span>
        </div>


        {/* Divider */}
        <div className="mt-10 flex justify-center">
          <div className="h-[2px] w-12 rounded-full bg-[#1E88E5]/40" />
        </div>

        {/* Main Headline */}
        <h1 className="mt-8 max-w-[620px] text-xl font-extrabold leading-relaxed text-slate-800 sm:text-2xl">
          우리 모임 안에서{" "}
          <span className="text-[#1E88E5]">누가 누구랑 잘 맞는지</span>
          <br className="hidden sm:block" />
          흐름으로 보여주는 케미 분석
        </h1>

        {/* Description */}
        <p className="mt-6 max-w-[640px] text-[15px] leading-8 text-slate-600">
          단순한 궁합이 아니라{" "}
          <span className="font-semibold text-slate-900">대화의 방향</span>,{" "}
          <span className="font-semibold text-slate-900">결정 속도</span>,{" "}
          <span className="font-semibold text-slate-900">역할의 균형</span>을 기반으로
          <br className="hidden sm:block" />
          모임의 케미를{" "}
          <span className="font-semibold text-[#1E88E5]">랭킹</span>과{" "}
          <span className="font-semibold text-[#1E88E5]">관계도</span>로 정리합니다.
        </p>

        {/* Secondary Description */}
        <p className="mt-6 max-w-[600px] text-[14px] leading-7 text-slate-500">
          친구, 회사, 동네 모임까지 —
          링크 하나로 방을 만들고 각자 참여하면
          결과가 자동으로 생성됩니다.
        </p>

        {/* Actions */}
        <div className="mt-12 flex w-full max-w-[500px] flex-col gap-4 sm:flex-row sm:justify-center">
          <Link
            href="/mbti"
            target="_self"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-[#1E88E5] px-6 py-3 text-sm font-extrabold text-white transition hover:opacity-95"
          >
            MBTI로 시작하기
          </Link>

          <button
            type="button"
            disabled
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-sm font-extrabold text-slate-400"
            aria-disabled="true"
          >
            사주 (준비중)
          </button>
        </div>

        {/* Footer text */}
        <div className="mt-10 text-[12px] font-medium text-slate-400">
          로그인 없이 사용 가능 · 최근 모임은 이 기기에 저장됩니다
        </div>

      </div>
    </main>
  );
}
