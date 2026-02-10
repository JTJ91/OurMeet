// app/g/[groupId]/GraphServer.tsx
import { prisma } from "@/lib/prisma";
import GraphClient from "./GraphClient";
import { getCompatScore } from "@/lib/mbtiCompat";

type Level = 1 | 2 | 3 | 4 | 5;

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
      <section className="mt-4 rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm backdrop-blur-md">
        <p className="text-sm text-slate-500">아직 참여한 멤버가 없어요.</p>
      </section>
    );
  }

  // ✅ 서버에서 센터 결정(쿼리스트링 center=... 있으면 그 멤버, 없으면 첫번째)
  const center =
    (centerId ? members.find((m) => m.id === centerId) : null) ?? members[0];

  const nodes = members
  .filter((m) => m.id !== center.id)
  .map((m) => {
    const { score, level } = getCompatScore(
      center.id,
      center.mbti,
      m.id,
      m.mbti
    );

    return {
      id: m.id,
      name: m.nickname,
      mbti: m.mbti.toUpperCase(),
      score, // ✅ 리포트와 동일한 소수점 점수
      level, // ✅ 같은 기준의 레벨
    };
  });


  return (
    <GraphClient
      groupId={group.id}
      groupName={group.name}
      center={center}
      nodes={nodes}
      memberCount={members.length}
    />
  );
}
