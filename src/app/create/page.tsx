import Link from "next/link";
import { createGroupAction } from "@/app/actions/group";

export default function CreatePage() {
  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900 pb-26">
      {/* Centered "mobile-like" container */}
      <div className="mx-auto flex min-h-screen max-w-[760px] flex-col px-5 pt-8">
        {/* Header (메인과 동일 톤) */}
        <header className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            모임<span className="text-[#1E88E5]">랭킹</span>
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            모임을 만들고 초대 링크를 공유해요
          </p>

          <div className="mt-4">
            <Link
              href="/"
              className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-700"
            >
              메인으로
            </Link>
          </div>
        </header>

        {/* Hero 카드 (메인과 유사) */}
        <section className="mt-10">
          <div className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
            <h2 className="text-2xl font-extrabold leading-tight">
              <span className="underline decoration-[#FDD835]/70">
                모임 만들기
              </span>
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              모임 이름, 별명, MBTI를 입력하면<br />
              바로 <b className="text-slate-800">초대 링크</b>를 만들 수 있어요.
            </p>
          </div>
        </section>

        {/* Form 카드 */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <form action={createGroupAction} className="space-y-4">
              <label className="block">
                <div className="text-sm font-semibold text-slate-800">
                  모임 이름
                </div>
                <input
                  name="groupName"
                  placeholder="예) 회사 동기 모임"
                  required
                  className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-[#1E88E5]/40 focus:shadow-[0_0_0_3px_rgba(30,136,229,0.12)]"
                />
              </label>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="block">
                  <div className="text-sm font-semibold text-slate-800">
                    내 별명
                  </div>
                  <input
                    name="nickname"
                    placeholder="예) 태주"
                    required
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-[#1E88E5]/40 focus:shadow-[0_0_0_3px_rgba(30,136,229,0.12)]"
                  />
                </label>

                <label className="block">
                  <div className="text-sm font-semibold text-slate-800">
                    내 MBTI
                  </div>
                  <input
                    name="mbti"
                    placeholder="예) ENFP"
                    required
                    inputMode="text"
                    autoCapitalize="characters"
                    className="mt-2 w-full rounded-2xl border border-black/10 bg-white/90 px-4 py-3 text-sm uppercase outline-none placeholder:text-slate-400 focus:border-[#1E88E5]/40 focus:shadow-[0_0_0_3px_rgba(30,136,229,0.12)]"
                  />
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-500">
                    대소문자 상관없어요. (enfp / ENFP 모두 OK)
                  </p>
                </label>
              </div>

              {/* maxMembers 안내(현재는 기본 10 고정) */}
              <div className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
                <div className="text-sm font-semibold text-slate-800">
                  최대 인원
                </div>
                <p className="mt-1 text-sm text-slate-600">
                  기본 <b className="text-slate-800">10명</b> · (추후 광고 시청 시{" "}
                  <b className="text-slate-800">20명</b>으로 확장)
                </p>
                {/* 지금은 서버액션에서 기본값(10) 쓰면 됨 */}
                <input type="hidden" name="maxMembers" value="10" />
              </div>

              <button
                type="submit"
                className="mt-2 w-full rounded-2xl bg-[#1E88E5] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-95 active:scale-[0.99]"
              >
                모임 만들기
              </button>
            </form>
          </div>
        </section>

        {/* Note */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-5 ring-1 ring-black/5">
            <p className="text-xs leading-relaxed text-slate-500">
              ※ 결과는 재미를 위한 참고용이에요. 관계 판단/결정의 근거로 사용하지 마세요.
            </p>
          </div>
        </section>

        {/* Footer links (메인과 톤 맞춤) */}
        <footer className="mt-10 border-black/5 py-10 text-center text-xs text-slate-500">
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
      </div>
    </main>
  );
}
