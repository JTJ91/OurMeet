import React from "react";
import { useTranslations } from "next-intl";
import { levelFromScore } from "@/lib/mbti/mbtiCompat";

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

type PairRow = {
  aId: string; aName: string; aMbti: string;
  bId: string; bName: string; bMbti: string;
  score: number;
};

type Props = {
  best3: PairRow[];
  worst3: PairRow[];
  memberCount?: number;
};

export default function ChemTopWorstIntl({ best3, worst3, memberCount }: Props) {
  const t = useTranslations("groupComponents.chemTopWorst");

  const pairCount = best3.length + worst3.length;
  const isNoPairs = pairCount === 0;

  if (isNoPairs) {
    const msg =
      (memberCount ?? 0) <= 1
        ? t("empty.oneMember")
        : t("empty.needMbti");

    return (
      <div className="mt-3 rounded-2xl border border-slate-200/70 bg-white/85 p-4 shadow-[0_6px_16px_rgba(15,23,42,0.05)]">
        <div className="text-xs font-extrabold text-slate-800">{t("title")}</div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{msg}</p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {[t("bestHeader"), t("worstHeader")].map((label, i) => (
            <div key={i} className="rounded-xl border border-slate-200/70 bg-white/88 p-3">
              <div className="text-[11px] font-extrabold text-slate-500">{label}</div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200/70" />
              <div className="mt-2 text-[11px] text-slate-400">{t("empty.noData")}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-[#1E88E5]">{t("bestTag")}</span>
          <span className="text-[11px] text-slate-400">TOP 3</span>
        </div>

        <ul className="space-y-2">
          {best3.map((p, idx) => {
            const s = Number.isFinite(Number(p.score)) ? Number(p.score) : 0;
            return (
              <li key={`best-${p.aId}-${p.bId}`} className="rounded-xl border border-slate-200/70 bg-white/88 px-3 py-2">
                <div className="flex items-start gap-2 text-xs font-extrabold text-slate-800">
                  <span className="shrink-0 text-slate-400">{idx + 1}.</span>
                  <span className="leading-snug break-words">{p.aName} × {p.bName}</span>
                </div>

                <div className="mt-0.5 pl-5 text-[12px] font-extrabold">
                  <span style={{ color: scoreColor(s) }}>{s.toFixed(2)}{t("scoreUnit")}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-rose-600">{t("worstTag")}</span>
          <span className="text-[11px] text-slate-400">WORST 3</span>
        </div>

        <ul className="space-y-2">
          {worst3.map((p, idx) => {
            const s = Number.isFinite(Number(p.score)) ? Number(p.score) : 0;
            return (
              <li key={`worst-${p.aId}-${p.bId}`} className="rounded-xl border border-slate-200/70 bg-white/88 px-3 py-2">
                <div className="flex items-start gap-2 text-xs font-extrabold text-slate-800">
                  <span className="shrink-0 text-slate-400">{idx + 1}.</span>
                  <span className="leading-snug break-words">{p.aName} × {p.bName}</span>
                </div>

                <div className="mt-0.5 pl-5 text-[12px] font-extrabold">
                  <span style={{ color: scoreColor(s) }}>{s.toFixed(2)}{t("scoreUnit")}</span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
