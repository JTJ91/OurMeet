import React from "react";
import { getCompatScore, levelFromScore } from "@/lib/mbtiCompat";

type Level = 1 | 2 | 3 | 4 | 5;

const LEVEL_META: Record<Level, { label: string; color: string }> = {
  5: { label: "찰떡궁합", color: "#1E88E5" },
  4: { label: "합좋은편", color: "#00C853" },
  3: { label: "그럭저럭", color: "#FDD835" },
  2: { label: "조율필요", color: "#FB8C00" },
  1: { label: "위험", color: "#E53935" },
};

function scoreColor(score: number) {
  return LEVEL_META[levelFromScore(score)].color;
}

type PairRow = {
  aId: string; aName: string; aMbti: string;
  bId: string; bName: string; bMbti: string;
  score: number;
};

type Props = {
  best3: PairRow[];
  worst3: PairRow[];
};

export default function ChemTopWorst({ best3, worst3 }: Props) {
  return (
    <div className="mt-3 grid grid-cols-2 gap-3">
      {/* LEFT: BEST */}
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-[#1E88E5]">🔥 최고</span>
          <span className="text-[11px] text-slate-400">TOP 3</span>
        </div>

        <ul className="space-y-2">
          {best3.map((p, idx) => {
            const r = getCompatScore(p.aId, p.aMbti, p.bId, p.bMbti);

            return (
              <li
                key={`best-${p.aId}-${p.bId}`}
                className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-1.5 ring-1 ring-black/5"
              >
                <div className="flex items-center gap-2 min-w-0 text-xs font-extrabold text-slate-800">
                  <span className="text-slate-400">{idx + 1}.</span>
                  <span className="truncate">{p.aName} × {p.bName}</span>
                </div>

                <span
                  className="shrink-0 text-[12px] font-extrabold"
                  style={{ color: scoreColor(r.score) }}
                >
                  {r.score.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* RIGHT: WORST */}
      <div className="min-w-0">
        <div className="mb-2 flex items-center gap-2">
          <span className="text-[11px] font-extrabold text-rose-600">🥶 최악</span>
          <span className="text-[11px] text-slate-400">WORST 3</span>
        </div>

        <ul className="space-y-2">
          {worst3.map((p, idx) => {
            const r = getCompatScore(p.aId, p.aMbti, p.bId, p.bMbti);

            return (
              <li
                key={`worst-${p.aId}-${p.bId}`}
                className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-1.5 ring-1 ring-black/5"
              >
                <div className="flex items-center gap-2 min-w-0 text-xs font-extrabold text-slate-800">
                  <span className="text-slate-400">{idx + 1}.</span>
                  <span className="truncate">{p.aName} × {p.bName}</span>
                </div>

                <span
                  className="shrink-0 text-[12px] font-extrabold"
                  style={{ color: scoreColor(r.score) }}
                >
                  {r.score.toFixed(2)}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
