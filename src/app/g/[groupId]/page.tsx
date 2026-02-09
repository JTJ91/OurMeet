import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InviteActions from "@/components/InviteActions";
import RememberGroupClient from "@/components/RememberGroupClient";
import GraphServer from "./GraphServer";
import { calcCompatScore } from "@/lib/mbtiCompat";
import { unstable_cache } from "next/cache";

import Link from "next/link";

const getRankings = unstable_cache(
  async (groupId: string) => {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) return null;

    const isValidMbti = (s?: string | null) => /^[EI][NS][TF][JP]$/i.test((s ?? "").trim());

    const membersForRank = group.members
      .filter((m) => isValidMbti(m.mbti))
      .map((m) => ({
        id: m.id,
        nickname: m.nickname,
        mbti: (m.mbti ?? "").trim().toUpperCase(),
      }));

    type PairRow = {
      aId: string; aName: string; aMbti: string;
      bId: string; bName: string; bMbti: string;
      score: number;
    };

    const pairs: PairRow[] = [];
    for (let i = 0; i < membersForRank.length; i++) {
      for (let j = i + 1; j < membersForRank.length; j++) {
        const a = membersForRank[i];
        const b = membersForRank[j];
        pairs.push({
          aId: a.id,
          aName: a.nickname,
          aMbti: a.mbti,
          bId: b.id,
          bName: b.nickname,
          bMbti: b.mbti,
          score: calcCompatScore(a.mbti, b.mbti),
        });
      }
    }

    const best3 = [...pairs].sort((x, y) => y.score - x.score).slice(0, 3);
    const worst3 = [...pairs].sort((x, y) => x.score - y.score).slice(0, 3);

    return { group, best3, worst3 };
  },
  ["group-rankings"],
  { revalidate: 60 } // 60초 캐시(원하면 10~300으로 조절)
);

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams?: Promise<{ center?: string }>;
}) {
  const { groupId } = await params;
  const sp = (await searchParams) ?? {};
  const centerId = sp.center;

  const cached = await getRankings(groupId);
  if (!cached) return notFound();

  const { group, best3, worst3 } = cached;

  const count = group.members.length;
  const max = group.maxMembers;
  const ratio = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;

  const center = (centerId ? group.members.find((m) => m.id === centerId) : null) ?? group.members[0];

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900 pb-24">
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

        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">🏆 케미 랭킹</div>
              <div className="text-[11px] text-slate-500">모임 전체 기준</div>
            </div>

            {best3.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                랭킹을 보려면 MBTI를 입력한 멤버가 2명 이상 필요해요.
              </p>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {/* LEFT: BEST */}
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-[#1E88E5]">🔥 최고</span>
                    <span className="text-[11px] text-slate-400">TOP 3</span>
                  </div>

                  <ul className="space-y-2">
                    {best3.map((p, idx) => (
                      <li
                        key={`best-${p.aId}-${p.bId}`}
                        className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-1.5 ring-1 ring-black/5"
                      >
                        <div className="flex items-center gap-2 min-w-0 text-xs font-extrabold text-slate-800">
                          <span className="text-slate-400">{idx + 1}.</span>
                          <span className="truncate">
                            {p.aName} × {p.bName}
                          </span>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#1E88E5]/10 px-2 py-0.5 text-[11px] font-extrabold text-[#1E88E5]">
                          {p.score}
                        </span>
                      </li>

                    ))}
                  </ul>
                </div>

                {/* RIGHT: WORST */}
                <div className="min-w-0">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-[11px] font-extrabold text-rose-600">🥶 최악</span>
                    <span className="text-[11px] text-slate-400">WORST 3</span>
                  </div>

                  <ul className="space-y-2">
                    {worst3.map((p, idx) => (
                      <li
                        key={`worst-${p.aId}-${p.bId}`}
                        className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-1.5 ring-1 ring-black/5"
                      >
                        <div className="flex items-center gap-2 min-w-0 text-xs font-extrabold text-slate-800">
                          <span className="text-slate-400">{idx + 1}.</span>
                          <span className="truncate">
                            {p.aName} × {p.bName}
                          </span>
                        </div>

                        <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-extrabold text-rose-600">
                          {p.score}
                        </span>
                      </li>

                    ))}
                  </ul>
                </div>
              </div>
            )}
        
          </div>
        </section>


        <GraphServer groupId={groupId} centerId={centerId} />
  
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
