import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InviteActions from "@/components/InviteActions";
import RememberGroupClient from "@/components/RememberGroupClient";
import Link from "next/link";

export default async function GroupPage({
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

  const count = group.members.length;
  const max = group.maxMembers;
  const ratio = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900 pb-24">
      <RememberGroupClient groupId={group.id} groupName={group.name} />
      
      <div className="mx-auto max-w-[760px] px-5 pt-6">
        {/* Top left back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <span aria-hidden>←</span>
            <span>메인으로</span>
          </Link>
        </div>

        {/* Unified top card */}
        <section className="mt-4">
          <div className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-500">모임</div>
                <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight">
                  {group.name}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  현재 <b>{count}명</b> 참여 중 · 최대 <b>{max}명</b>
                </p>
              </div>

              <div className="relative">
                <InviteActions groupId={group.id} />
              </div>
            </div>

            {/* progress */}
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-slate-200/70">
                <div
                  className="h-2 rounded-full bg-[#1E88E5]"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>

            {/* actions */}
            <div className="mt-5">
              {/* join as link (server-safe) */}
              <Link
                href={`/g/${group.id}/join`}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E88E5] text-sm font-extrabold text-white transition-all duration-200 hover:bg-[#1E88E5]/90 active:scale-[0.98]"
              >
                <span aria-hidden>🫶</span>
                <span className="whitespace-nowrap">모임 참여하기</span>
              </Link>
        
            </div>
          </div>
        </section>

        {/* 참여 멤버 (임시) */}
        <section className="mt-4 rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between">
            <div className="text-sm font-extrabold text-slate-900">참여 멤버</div>
            <div className="text-xs font-bold text-slate-500">
              {group.members.length}명
            </div>
          </div>

          {group.members.length === 0 ? (
            <p className="text-sm text-slate-500">아직 참여한 멤버가 없어요.</p>
          ) : (
            <ul className="space-y-2">
              {group.members
                .slice()
                .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                .map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-black/5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-extrabold text-slate-900">
                        {m.nickname}
                      </div>
                      <div className="text-xs font-bold text-slate-500">
                        {m.mbti.toUpperCase()}
                      </div>
                    </div>

                    <span className="rounded-full bg-[#1E88E5]/10 px-2.5 py-1 text-xs font-extrabold text-[#1E88E5]">
                      {m.mbti.toUpperCase()}
                    </span>
                  </li>
                ))}
            </ul>
          )}
        </section>

        
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-5 ring-1 ring-black/5">
            <p className="text-xs leading-relaxed text-slate-500">
              ※ 결과는 재미를 위한 참고용이에요. 관계 판단/결정의 근거로 사용하지
              마세요.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
