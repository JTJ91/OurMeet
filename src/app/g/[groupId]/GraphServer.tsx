// app/g/[groupId]/GraphServer.tsx
import { prisma } from "@/lib/prisma";
import GraphClient from "./GraphClient";
import { calcCompatLevel, calcCompatScore } from "@/lib/mbtiCompat";

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

  // ✅ 서버에서 nodes(레벨)까지 완성해서 내려보내기
  const nodes = members
  .filter((m) => m.id !== center.id)
  .map((m) => ({
    id: m.id,
    name: m.nickname,
    mbti: m.mbti.toUpperCase(),
    score: calcCompatScore(center.mbti, m.mbti),          // ✅ 추가
    level: calcCompatLevel(center.mbti, m.mbti),          // ✅ 그대로
  }));


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
