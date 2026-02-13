// app/g/[groupId]/GraphServer.tsx
import { prisma } from "@/app/lib/mbti/prisma";
import GraphClient from "./GraphClient";
import { getCompatScore } from "@/app/lib/mbti/mbtiCompat";


type Level = 1 | 2 | 3 | 4 | 5;

function GraphSectionCard({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="mbti-card-frame overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        {/* 헤더 스트립 */}
        <div className="border-b border-slate-200/60 bg-[#1E88E5]/[0.05] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#1E88E5]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#1E88E5]">
                  🧭 {title}
                </span>
                {subtitle ? (
                  <span className="text-[11px] font-bold text-slate-500">
                    {subtitle}
                  </span>
                ) : null}
              </div>
            </div>

            {right ? <div className="shrink-0">{right}</div> : null}
          </div>
        </div>

        {/* 본문 */}
        <div className="">{children}</div>
      </div>
    </section>
  );
}

export default async function GraphServer({
  groupId,
  centerId,
}: {
  groupId: string;
  centerId?: string;
}) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) return null;

  const members = group.members.map((m) => ({
    id: m.id,
    nickname: m.nickname,
    mbti: (m.mbti || "").toUpperCase(),
  }));

  if (members.length === 0) {
    return (
      <section className="mbti-card-frame mt-4 rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <p className="text-sm text-slate-500">아직 참여한 멤버가 없어요.</p>
      </section>
    );
  }

  // ✅ 서버에서 센터 결정(쿼리스트링 center=... 있으면 그 멤버, 없으면 첫번째)
  const center =
    (centerId ? members.find((m) => m.id === centerId) : null) ?? members[0];

  // ✅ 서버에서 nodes(레벨)까지 완성해서 내려보내기
  const nodes = members
  .filter((m) => m.id !== center.id)
  .map((m) => {
    const compat = getCompatScore(center.id, center.mbti, m.id, m.mbti);

    return {
      id: m.id,
      name: m.nickname,
      mbti: m.mbti.toUpperCase(),
      score: compat.score, // ✅ 마이크로(소수점) = 리포트/캔버스 동일
      level: compat.level, // ✅ 마이크로 기준 레벨(색/범례도 동일)
      // type: compat.type, // 필요하면 추가 가능
    };
  });

  const pairScores: number[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];
      const compat = getCompatScore(a.id, a.mbti, b.id, b.mbti);
      if (Number.isFinite(compat.score)) pairScores.push(compat.score);
    }
  }
  const pairAverageScore =
    pairScores.length > 0
      ? pairScores.reduce((sum, score) => sum + score, 0) / pairScores.length
      : null;

  return (
    <GraphSectionCard
      title="관계도"
      subtitle="센터 기준 케미 연결"
    >
      <GraphClient
        groupId={group.id}
        groupName={group.name}
        center={center}
        nodes={nodes}
        memberCount={members.length}
        pairAverageScore={pairAverageScore}
      />
    </GraphSectionCard>
  );


}
