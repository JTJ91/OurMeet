"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import EgoGraphCanvasResponsiveIntl, { EgoNode } from "@/app/[locale]/components/mbti/EgoGraphCanvasResponsive";
import SaveGroupClient from "@/app/[locale]/components/SaveGroupClient";
import Link from "next/link";
import { useTranslations } from "next-intl";

type GraphLocale = "ko" | "en" | "ja";

export default function GraphClientIntl({
  locale,
  groupId,
  groupName,
  center,
  nodes,
  memberCount,
  pairAverageScore,
}: {
  locale: GraphLocale;
  groupId: string;
  groupName: string;
  center: { id: string; nickname: string; mbti: string };
  nodes: EgoNode[];
  memberCount: number;
  pairAverageScore: number | null;
}) {
  const t = useTranslations("groupGraph.client");
  const base = locale === "ko" ? "" : `/${locale}`;

  const router = useRouter();
  const sp = useSearchParams();

  const [slotEl, setSlotEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setSlotEl(document.getElementById("group-actions-slot"));
  }, []);

  const actions = useMemo(() => {
    const centerLabel = t("centerLabel", { nickname: center.nickname, mbti: center.mbti });

    return (
      <div className="space-y-2.5">
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/85 px-3.5 py-2.5 shadow-[0_6px_16px_rgba(15,23,42,0.05)]">
          <div className="flex min-w-0 items-center gap-2">
            <span className="shrink-0 text-[11px] font-extrabold text-slate-500">{t("centerInfo")}</span>
            <span className="h-1 w-1 shrink-0 rounded-full bg-slate-300" />
            <span className="truncate text-[12px] font-extrabold text-slate-900">{center.nickname}</span>
            <span className="shrink-0 rounded-full bg-slate-900/5 px-2 py-0.5 text-[11px] font-extrabold text-slate-700">
              {center.mbti}
            </span>
          </div>
        </div>

        <p className="px-1 text-[11px] leading-relaxed text-slate-500">{t("saveGuide", { center: centerLabel })}</p>

        <div className="grid grid-cols-2 gap-2.5">
          <Link
            href={`${base}/mbti/g/${groupId}/join`}
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
            <span className="whitespace-nowrap">{t("join")}</span>
          </Link>

          <div title={t("saveTitle", { center: centerLabel })}>
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
  }, [base, center.id, center.mbti, center.nickname, groupId, groupName, t]);

  return (
    <>
      {slotEl ? createPortal(actions, slotEl) : null}

      <EgoGraphCanvasResponsiveIntl
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
          router.replace(`${base}/mbti/g/${groupId}?${next.toString()}`);
        }}
      />
    </>
  );
}
