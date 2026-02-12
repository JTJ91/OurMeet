import Link from "next/link";
import { prisma } from "@/app/lib/mbti/prisma";
import { notFound } from "next/navigation";
import { joinGroupAction } from "@/app/mbti/actions/members";
import JoinFormClient from "./JoinFormClient";

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
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900 pb-10">
      <div className="mx-auto max-w-[760px] px-5 pt-6">
        {/* 상단 */}
        <div className="mb-4 flex items-center justify-between">
          <Link
            href={`/mbti/g/${groupId}`}
            className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 hover:bg-white"
          >
            ← 뒤로
          </Link>

          <div className="text-sm font-extrabold text-slate-900">모임 참가</div>

          <div className="w-[54px]" />
        </div>

        {/* 카드 */}
        <div className="rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm backdrop-blur-md">
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

          <div className="mt-4 h-2 w-full rounded-full bg-slate-200">
            <div
              className="h-2 rounded-full bg-[#1E88E5]"
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

        <div className="mt-4 rounded-3xl bg-white/70 p-5 ring-1 ring-black/5">
          <p className="text-xs leading-relaxed text-slate-500">
            ※ 결과는 재미를 위한 참고용이에요. 관계 판단/결정의 근거로 사용하지
            마세요.
          </p>
        </div>
      </div>
    </main>
  );
}
