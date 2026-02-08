import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { joinGroupAction } from "@/app/actions/members";

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
            href={`/g/${groupId}`}
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

          <form action={joinGroupAction} className="mt-5 space-y-4">
            <input type="hidden" name="groupId" value={groupId} />

            <label className="block">
              <div className="text-sm font-bold text-slate-800">내 별명</div>
              <input
                name="nickname"
                required
                maxLength={20}
                placeholder="예) 태주"
                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none focus:border-[#1E88E5]/50"
                disabled={isFull}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                모임에서 표시될 이름이에요.
              </p>
            </label>

            <label className="block">
              <div className="text-sm font-bold text-slate-800">MBTI</div>
              <input
                name="mbti"
                required
                maxLength={4}
                placeholder="예) ENFP"
                className="mt-2 h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm uppercase outline-none focus:border-[#1E88E5]/50"
                disabled={isFull}
              />
              <p className="mt-1 text-[11px] text-slate-500">
                4글자(ENFP) 형태로 입력해요.
              </p>
            </label>

            <button
              type="submit"
              disabled={isFull}
              className={`w-full rounded-2xl px-4 py-4 text-sm font-extrabold text-white transition-all duration-200 active:scale-[0.98]
              ${
                isFull
                  ? "bg-slate-300"
                  : "bg-[#1E88E5] hover:bg-[#1E88E5]/90"
              }`}
            >
              {isFull ? "정원이 가득 찼어요" : "🫶 모임에 참가하기"}
            </button>
          </form>
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
