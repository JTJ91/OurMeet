import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/app/lib/mbti/prisma";
import { notFound } from "next/navigation";
import { joinGroupAction } from "@/app/mbti/actions/members";
import JoinFormClient from "./JoinFormClient";
import { alternatesForPath } from "@/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ groupId: string }>;
}): Promise<Metadata> {
  const { groupId } = await params;
  return {
    alternates: alternatesForPath(`/mbti/g/${groupId}/join`),
  };
}

export default async function GroupJoinPage({
  params,
}: {
  params: Promise<{ groupId: string }>;
}) {
  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) return notFound();

  const isFull = group.members.length >= group.maxMembers;

  return (
    <main className="mbti-page-bg pb-10">
      <div className="mbti-shell">
        {/* 상단 */}
        <div className="mbti-card-frame mb-4 flex items-center justify-between">
          <Link
            href={`/mbti/g/${groupId}`}
            className="mbti-back-btn"
          >
            ← 뒤로
          </Link>

          <div className="text-sm font-extrabold text-slate-900">모임 참가</div>

          <div className="w-[54px]" />
        </div>

        {/* 카드 */}
        <div className="mbti-card mbti-card-frame p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-500">모임</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">
                {group.name}
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                현재 <b>{group.members.length}명</b> 참여 중 · 최대{" "}
                <b>{group.maxMembers}명</b>
              </p>
            </div>
          </div>

          <div className="mbti-progress-track mt-4">
            <div
              className="mbti-progress-fill"
              style={{
                width: `${Math.min(
                  100,
                  (group.members.length / group.maxMembers) * 100
                )}%`,
              }}
            />
          </div>

          <JoinFormClient groupId={groupId} isFull={isFull} />
        </div>

        <div className="mbti-card-soft mbti-card-frame mt-4 p-5">
          <p className="text-xs leading-relaxed text-slate-500">
            ※ 결과는 재미를 위한 참고용이에요. 관계 판단/결정의 근거로 사용하지
            마세요.
          </p>
        </div>
      </div>
    </main>
  );
}
