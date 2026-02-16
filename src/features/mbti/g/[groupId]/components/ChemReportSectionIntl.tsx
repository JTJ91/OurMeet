"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { getCompatScore, axisDiffCount, levelFromScore } from "@/lib/mbti/mbtiCompat";
import ChemMoreListIntl from "./ChemMoreListIntl";
import type { MemberPrefs } from "@/lib/mbti/memberPrefs";

type JudgeStyle = "LOGIC" | "PEOPLE";
type InfoStyle = "IDEA" | "FACT";

type PairRow = {
  aId: string; aName: string; aMbti: string;
  bId: string; bName: string; bMbti: string;
  score: number;
  micro?: number;
  aJudge?: JudgeStyle; aInfo?: InfoStyle;
  bJudge?: JudgeStyle; bInfo?: InfoStyle;
  aPrefs?: MemberPrefs;
  bPrefs?: MemberPrefs;
};

type ChemType = "STABLE" | "COMPLEMENT" | "SPARK" | "EXPLODE";
type Props = { pairs: PairRow[] };

type Level = 1 | 2 | 3 | 4 | 5;

const LEVEL_COLOR: Record<Level, string> = {
  5: "#1E88E5",
  4: "#00C853",
  3: "#FDD835",
  2: "#FB8C00",
  1: "#E53935",
};

function scoreColor(score: number) {
  return LEVEL_COLOR[levelFromScore(score)];
}

function classifyChemType(a: string, b: string, score: number): ChemType {
  const A = a.trim().toUpperCase();
  const B = b.trim().toUpperCase();
  const diff =
    (A[0] !== B[0] ? 1 : 0) +
    (A[1] !== B[1] ? 1 : 0) +
    (A[2] !== B[2] ? 1 : 0) +
    (A[3] !== B[3] ? 1 : 0);

  if (score >= 72) return diff >= 2 ? "COMPLEMENT" : "STABLE";
  if (score >= 62) return diff >= 3 ? "SPARK" : "STABLE";
  if (score >= 54) return diff >= 3 ? "SPARK" : "COMPLEMENT";
  return diff >= 2 ? "EXPLODE" : "SPARK";
}

function chemComboTitle(type: ChemType, a: string, b: string, score: number) {
  const diff = axisDiffCount(a, b);
  if (type === "STABLE") {
    if (diff <= 1) return "steady";
    if (diff === 2) return "balanced";
    return "stable";
  }
  if (type === "COMPLEMENT") {
    if (diff >= 3) return "fill-gap";
    return "role-share";
  }
  if (type === "SPARK") {
    if (diff >= 3) return "stimulating";
    return "spark";
  }
  if (score < 45) return "risk";
  return "caution";
}

function top5RankSlots(list: PairRow[], type: ChemType) {
  const withScore: Array<PairRow & { scoreInt: number; micro: number }> = list.map((p) => {
    const r = getCompatScore(p.aId, p.aMbti, p.bId, p.bMbti, p.aPrefs, p.bPrefs);
    return {
      ...p,
      scoreInt: r.scoreInt,
      micro: r.score,
    };
  });

  const sorted = [...withScore].sort((a, b) => {
    const aInt = a.scoreInt;
    const bInt = b.scoreInt;
    const aMicro = a.micro ?? aInt;
    const bMicro = b.micro ?? bInt;

    if (type === "EXPLODE") {
      if (aInt !== bInt) return aInt - bInt;
      return aMicro - bMicro;
    }
    if (aInt !== bInt) return bInt - aInt;
    return bMicro - aMicro;
  });

  const EPS = 0.01;
  const slots: Array<{ scoreInt: number; microKey: number; items: PairRow[] }> = [];
  for (const p of sorted) {
    const pInt = p.scoreInt;
    const mk = p.micro ?? pInt;

    const last = slots[slots.length - 1];
    if (last && last.scoreInt === pInt && Math.abs(last.microKey - mk) <= EPS) {
      last.items.push(p);
    } else {
      slots.push({ scoreInt: pInt, microKey: mk, items: [p] });
    }
  }

  return slots.slice(0, 5);
}

export default function ChemReportSectionIntl({ pairs }: Props) {
  const t = useTranslations("groupComponents.chemReport");

  const dist: Record<ChemType, number> = { STABLE: 0, COMPLEMENT: 0, SPARK: 0, EXPLODE: 0 };
  const byType: Record<ChemType, PairRow[]> = { STABLE: [], COMPLEMENT: [], SPARK: [], EXPLODE: [] };

  for (const p of pairs) {
    const r = getCompatScore(p.aId, p.aMbti, p.bId, p.bMbti, p.aPrefs, p.bPrefs);
    const type = classifyChemType(p.aMbti, p.bMbti, r.scoreInt);
    dist[type]++;
    byType[type].push(p);
  }

  const totalPairs = pairs.length || 1;
  const pct = (type: ChemType) => Math.round(((dist[type] ?? 0) / totalPairs) * 100);

  const sorted = (Object.keys(dist) as ChemType[]).sort((a, b) => dist[b] - dist[a]);
  const top = sorted[0] ?? "STABLE";

  const profile = (() => {
    if (pct("EXPLODE") >= 40) return t("profiles.explodeHigh");
    if (pct("SPARK") >= 45 && pct("EXPLODE") < 25) return t("profiles.sparkHigh");
    if (pct("STABLE") >= 50 && pct("EXPLODE") < 20) return t("profiles.stableHigh");
    if (pct("COMPLEMENT") >= 45 && pct("EXPLODE") < 25) return t("profiles.complementHigh");
    return t("profiles.mixed");
  })();

  const label = (type: ChemType) => {
    if (type === "STABLE") return t("labels.stable");
    if (type === "COMPLEMENT") return t("labels.complement");
    if (type === "SPARK") return t("labels.spark");
    return t("labels.explode");
  };

  const comment = (type: ChemType) => {
    if (type === "STABLE") return t("comments.stable");
    if (type === "COMPLEMENT") return t("comments.complement");
    if (type === "SPARK") return t("comments.spark");
    return t("comments.explode");
  };

  const leftBar = (type: ChemType) => {
    if (type === "STABLE") return "bg-sky-400";
    if (type === "COMPLEMENT") return "bg-emerald-400";
    if (type === "SPARK") return "bg-amber-400";
    return "bg-rose-400";
  };

  const accent = (type: ChemType) => {
    if (type === "STABLE") return "text-sky-700";
    if (type === "COMPLEMENT") return "text-emerald-700";
    if (type === "SPARK") return "text-amber-700";
    return "text-rose-700";
  };

  if (pairs.length === 0) {
    return <p className="mt-3 text-sm text-slate-500">{t("emptyNeedMembers")}</p>;
  }

  return (
    <>
      <div className="mt-3 space-y-3">
        {(["STABLE", "COMPLEMENT", "SPARK", "EXPLODE"] as ChemType[]).map((type) => {
          const list = (byType[type] ?? []).slice();
          const rankSlots = top5RankSlots(list, type);
          const percent = pct(type);

          return (
            <div
              key={type}
              className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/88 p-3 shadow-[0_6px_16px_rgba(15,23,42,0.05)]"
            >
              <div className={`absolute left-0 top-0 h-full w-1 ${leftBar(type)}`} />

              <div className="flex items-start justify-between gap-2 pl-2">
                <div className="min-w-0">
                  <div className={`truncate text-xs font-extrabold ${accent(type)}`}>{label(type)}</div>
                  <div className="mt-0.5 text-[11px] text-slate-500">{comment(type)}</div>
                </div>
              </div>

              <div className="mt-2 pl-2">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold text-slate-500">
                    {dist[type]} <span className="text-slate-300">·</span> {percent}%
                  </div>
                  <div className="text-[11px] font-bold text-slate-400">{t("overallOutOf", { count: pairs.length })}</div>
                </div>

                <div className="mt-2 h-2 w-full rounded-full bg-slate-200/80">
                  <div className={`h-2 rounded-full ${leftBar(type)}`} style={{ width: `${percent}%` }} />
                </div>
              </div>

              <div className="mt-3 pl-2">
                {rankSlots.length > 0 ? (
                  <ul className="overflow-hidden rounded-xl border border-slate-200/70 bg-white/88">
                    {rankSlots.map((slot, rankIdx) => (
                      <li key={`${type}-rank-${rankIdx}-${slot.scoreInt}`} className="border-b border-black/5 px-3 py-2 last:border-b-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex items-center gap-2">
                            <span className="w-4 shrink-0 text-center text-[11px] font-extrabold text-slate-400">{rankIdx + 1}</span>
                            <span className="truncate text-[11px] font-bold text-slate-600">
                              {t(`comboNames.${chemComboTitle(type, slot.items[0].aMbti, slot.items[0].bMbti, slot.microKey)}`)}
                            </span>
                          </div>
                          <span className="shrink-0 text-[11px] font-extrabold" style={{ color: scoreColor(slot.microKey) }}>
                            {slot.microKey.toFixed(2)}{t("scoreUnit")}
                          </span>
                        </div>

                        <div className="mt-1 space-y-0.5">
                          {slot.items.map((p) => (
                            <div key={`${type}-${p.aId}-${p.bId}`} className="flex items-center gap-1.5 text-[11px]" title={`${p.aMbti} × ${p.bMbti}`}>
                              <span className="w-4 shrink-0" />
                              <span className="truncate font-extrabold text-slate-800">{p.aName} × {p.bName}</span>
                              <span className="ml-auto shrink-0 font-bold text-slate-500">{p.aMbti}/{p.bMbti}</span>
                            </div>
                          ))}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="rounded-xl border border-slate-200/70 bg-white/88 px-3 py-3">
                    <div className="text-[11px] text-slate-500">{t("noneType")}</div>
                  </div>
                )}

                <ChemMoreListIntl t={type} list={list} picksLength={5} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-2">
        <div className="rounded-2xl border border-slate-200/70 bg-white/88 p-3 shadow-[0_6px_16px_rgba(15,23,42,0.05)]">
          <div className="text-[11px] font-extrabold text-slate-500">{t("groupProfileTitle")}</div>
          <div className="mt-1 text-xs font-extrabold leading-5 text-slate-800">{profile}</div>
          <div className="mt-2 text-[11px] text-slate-500">{t("topType", { type: label(top) })}</div>
        </div>
      </div>
    </>
  );
}
