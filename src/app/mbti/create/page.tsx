import Link from "next/link";
import { createGroupAction } from "@/app/mbti/actions/group";
import CreateFormClient from "./CreateFormClient";

export default function CreatePage() {
  return (
    <main className="bg-[#F5F9FF] text-slate-900 pb-10">
      {/* Centered "mobile-like" container */}
      <div className="mx-auto flex max-w-[760px] flex-col px-5 pt-8">
        {/* Top left back */}
        <div className="flex items-center justify-between">
          <Link
            href="/mbti"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <span aria-hidden>←</span>
            <span>뒤로가기</span>
          </Link>
        </div>

        {/* Hero 카드 (메인과 유사) */}
        <section className="mt-4">
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
            <CreateFormClient />
          </div>
        </section>

      </div>
    </main>
  );
}
