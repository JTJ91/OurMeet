import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

import RememberGroupClient from "@/components/RememberGroupClient";

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

  const shareUrl = `/g/${group.id}`;

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900 pb-26">
      <RememberGroupClient groupId={group.id} groupName={group.name} />
      
      <div className="mx-auto flex min-h-screen max-w-[760px] flex-col px-5 pt-8">
        {/* Header (메인 톤 맞춤) */}
        <header className="text-center">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            모임<span className="text-[#1E88E5]">랭킹</span>
          </h1>

          <p className="mt-3 text-sm text-slate-600">
            모임 안에서 <b className="text-[#1E88E5]">MBTI 인지기능</b>을 활용해 <br />
            서로의 관계 케미를 재미로 살펴봐요
          </p>

          <div className="mt-4">
            <Link
              href="/"
              className="text-sm text-slate-500 underline underline-offset-4 hover:text-slate-700"
            >
              ← 메인으로
            </Link>
          </div>
        </header>

        {/* Hero card */}
        <section className="mt-10">
          <div className="rounded-3xl bg-white/70 p-6 shadow-sm ring-1 ring-black/5">
            <div className="text-xs font-semibold text-slate-500">모임</div>

            <h2 className="mt-2 text-3xl font-extrabold leading-tight">
              {group.name}
            </h2>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              현재 <b className="text-slate-800">{group.members.length}명</b>이 참여 중이에요.{" "}
              <span className="text-slate-500">
                (최대 {group.maxMembers}명)
              </span>
            </p>
          </div>
        </section>

        {/* Stats / Actions */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-slate-800">인원 현황</div>
                <div className="mt-1 text-sm text-slate-600">
                  {group.members.length} / {group.maxMembers}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500">초대 링크</div>
                {/* 실제 배포 도메인 붙이고 싶으면 나중에 환경변수로 baseUrl 만들면 됨 */}
                <div className="mt-1 text-sm font-semibold text-slate-800">
                  {shareUrl}
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href={`/g/${group.id}/join`}
                className="w-full rounded-2xl bg-[#1E88E5] px-4 py-4 text-center text-sm font-extrabold text-white transition-all duration-200 hover:bg-[#1E88E5]/90 active:scale-[0.98]"
              >
                🙋‍♂️ 모임 참여하기
              </Link>

              <Link
                href={`/g/${group.id}/invite`}
                className="w-full rounded-2xl bg-white px-4 py-4 text-center text-sm font-extrabold text-slate-800 ring-1 ring-black/10 transition-all duration-200 hover:bg-black/[0.03] active:scale-[0.98]"
              >
                🔗 초대하기
              </Link>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              ※ 링크 공유 후 멤버들이 별명/MBTI를 입력하면 관계도가 자동으로 반영돼요.
            </p>
          </div>
        </section>

        {/* Members */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-slate-800">참여 멤버</div>
              <div className="text-xs text-slate-500">
                {group.members.length}명
              </div>
            </div>

            <div className="mt-4 space-y-2">
              {group.members.length === 0 ? (
                <div className="rounded-2xl bg-white/80 p-4 text-sm text-slate-600 ring-1 ring-black/5">
                  아직 참여한 멤버가 없어요. 초대 링크를 공유해보세요!
                </div>
              ) : (
                group.members.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between rounded-2xl bg-white/80 px-4 py-3 ring-1 ring-black/5"
                  >
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-900">
                        {m.nickname}
                      </div>
                      <div className="text-xs font-semibold text-slate-500">
                        {m.mbti}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Note */}
        <section className="mt-6 pb-10">
          <div className="rounded-3xl bg-white/70 p-5 ring-1 ring-black/5">
            <p className="text-xs leading-relaxed text-slate-500">
              ※ 결과는 재미를 위한 참고용이에요. 관계 판단/결정의 근거로 사용하지 마세요.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
