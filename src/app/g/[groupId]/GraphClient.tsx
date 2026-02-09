// app/g/[groupId]/GraphClient.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import EgoGraphCanvasResponsive, { EgoNode } from "@/components/EgoGraphCanvasResponsive";

export default function GraphClient({
  groupId,
  center,
  nodes,
  memberCount,
}: {
  groupId: string;
  center: { id: string; nickname: string; mbti: string };
  nodes: EgoNode[];
  memberCount: number;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  return (
    <section className="mt-4 rounded-3xl bg-white/80 p-5 ring-1 ring-black/5 shadow-sm backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-sm font-extrabold text-slate-900">관계도</div>
        <div className="text-xs font-bold text-slate-500">{memberCount}명</div>
      </div>

      <EgoGraphCanvasResponsive
        centerName={center.nickname}
        centerSub={center.mbti}
        nodes={nodes}
        ringCount={3}
        showLegend
        onCenterChange={(id) => {
          // ✅ 센터 변경을 쿼리스트링으로 반영 → 다시 서버에서 계산해서 내려줌
          const next = new URLSearchParams(sp?.toString());
          next.set("center", id);
          router.replace(`/g/${groupId}?${next.toString()}`);
        }}
      />
    </section>
  );
}
