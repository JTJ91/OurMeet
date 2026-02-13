// app/g/[groupId]/GraphClient.tsx
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import EgoGraphCanvasResponsive, { EgoNode } from "@/app/components/mbti/EgoGraphCanvasResponsive";
import SaveGroupClient from "@/app/components/SaveGroupClient";
import Link from "next/link";

export default function GraphClient({
  groupId,
  groupName,
  center,
  nodes,
  memberCount,
  pairAverageScore,
}: {
  groupId: string;
  groupName: string;
  center: { id: string; nickname: string; mbti: string };
  nodes: EgoNode[];
  memberCount: number;
  pairAverageScore: number | null;
}) {
  const router = useRouter();
  const sp = useSearchParams();

  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlotEl(document.getElementById("group-actions-slot"));
  }, []);

  const actions = useMemo(() => {
    const centerLabel = `${center.nickname} · ${center.mbti}`;

    return (
      <div className="space-y-2.5">
        {/* ✅ 현재 센터: 깔끔한 인포 바 */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/85 px-3.5 py-2.5 shadow-[0_6px_16px_rgba(15,23,42,0.05)]">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-extrabold text-slate-500 shrink-0">
              내 정보
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-300 shrink-0" />

            <span className="truncate text-[12px] font-extrabold text-slate-900">
              {center.nickname}
            </span>

            <span className="shrink-0 rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] font-extrabold text-slate-700">
              {center.mbti}
            </span>
          </div>

        </div>

        {/* ✅ 안내 문구: 저장 기준 명확히 */}
        <p className="px-1 text-[11px] leading-relaxed text-slate-500">
          ‘저장하기’를 누르면 <b className="text-slate-700">{centerLabel}</b> 기준으로
          최근모임 목록에 기록돼요.
        </p>

        {/* ✅ 버튼: 작게/컴팩트 */}
        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href={`/mbti/g/${groupId}/join`}
            className="
              flex h-10 w-full items-center justify-center gap-2
              rounded-2xl bg-gradient-to-r from-[#1E88E5] to-[#2f9dff]
              text-[13px] font-extrabold text-white
              shadow-[0_8px_18px_rgba(30,136,229,0.26)]
              transition-all duration-200
              hover:brightness-95
              active:scale-[0.98]
            "
          >
            <span aria-hidden className="text-[13px]">🫶</span>
            <span className="whitespace-nowrap">참여하기</span>
          </Link>

          <div title={`현재 센터(${centerLabel}) 기준으로 저장`}>
            <SaveGroupClient
              groupId={groupId}
              groupName={groupName}
              myMemberId={center.id}
              myNickname={center.nickname}
              myMbti={center.mbti}
            />
          </div>
        </div>
      </div>
    );
  }, [groupId, groupName, center.id, center.nickname, center.mbti]);


  return (
    <>
      {/* ✅ 버튼을 page.tsx 슬롯으로 순간이동 */}
      {slotEl ? createPortal(actions, slotEl) : null}

      <EgoGraphCanvasResponsive
        groupName={groupName}
        memberCount={memberCount}
        centerName={center.nickname}
        centerSub={center.mbti}
        nodes={nodes}
        pairAverageScore={pairAverageScore}
        ringCount={3}
        showLegend
        onCenterChange={(id) => {
          const next = new URLSearchParams(sp?.toString());
          next.set("center", id);
          router.replace(`/mbti/g/${groupId}?${next.toString()}`);
        }}
      />
    </>
  );
}
