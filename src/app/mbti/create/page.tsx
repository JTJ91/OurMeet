import type { Metadata } from "next";
import Link from "next/link";
import { createGroupAction } from "@/app/mbti/actions/group";
import CreateFormClient from "./CreateFormClient";
import { alternatesForPath } from "@/i18n/metadata";

export const metadata: Metadata = {
  alternates: alternatesForPath("/mbti/create"),
};

export default function CreatePage() {
  return (
    <main className="mbti-page-bg pb-10">
      {/* Centered "mobile-like" container */}
      <div className="mbti-shell flex flex-col">
        {/* Top left back */}
        <div className="mbti-card-frame flex items-center justify-between">
          <Link
            href="/mbti"
            className="mbti-back-btn"
          >
            <span aria-hidden>←</span>
            <span>뒤로가기</span>
          </Link>
        </div>

        {/* Hero 카드 (메인과 유사) */}
        <section className="mt-4">
          <div className="mbti-card mbti-card-frame p-6">
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
          <div className="mbti-card mbti-card-frame p-5">
            <CreateFormClient />
          </div>
        </section>

      </div>
    </main>
  );
}
