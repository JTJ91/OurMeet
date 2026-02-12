import React from "react";
import { getCompatScore, levelFromScore } from "@/app/lib/mbti/mbtiCompat";

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
  // ✅ 있으면 더 정확한 문구 가능 (없으면 자동 처리)
  memberCount?: number;
};

export default function ChemTopWorst({ best3, worst3, memberCount }: Props) {
  const pairCount = best3.length + worst3.length; // 보통 둘 다 0이면 페어 0
  const isNoPairs = pairCount === 0;

  if (isNoPairs) {
    const msg =
      (memberCount ?? 0) <= 1
        ? "지금은 1명이라 케미 조합이 없어요. 한 명만 더 들어오면 TOP/WORST가 바로 생겨요."
        : "아직 비교할 조합이 없어요. (MBTI가 2명 이상 입력되어야 케미가 계산돼요.)";

    return (
      <div className="mt-3 rounded-2xl bg-white/60 p-4 ring-1 ring-black/5">
        <div className="text-xs font-extrabold text-slate-800">케미 순위</div>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">{msg}</p>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {["🔥 최고 TOP 3", "🥶 최악 WORST 3"].map((t, i) => (
            <div key={i} className="rounded-xl bg-white/70 p-3 ring-1 ring-black/5">
              <div className="text-[11px] font-extrabold text-slate-500">{t}</div>
              <div className="mt-2 h-2 w-full rounded-full bg-slate-200/70" />
              <div className="mt-2 text-[11px] text-slate-400">아직 데이터 없음</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

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
                className="rounded-xl bg-white/60 px-3 py-2 ring-1 ring-black/5"
              >
                <div className="flex items-start gap-2 text-xs font-extrabold text-slate-800">
                  <span className="shrink-0 text-slate-400">{idx + 1}.</span>
                  <span className="leading-snug break-words">
                    {p.aName} × {p.bName}
                  </span>
                </div>

                <div className="mt-0.5 pl-5 text-[12px] font-extrabold">
                  <span style={{ color: scoreColor(r.score) }}>
                    {r.score.toFixed(2)}점
                  </span>
                </div>
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
                className="rounded-xl bg-white/60 px-3 py-2 ring-1 ring-black/5"
              >
                <div className="flex items-start gap-2 text-xs font-extrabold text-slate-800">
                  <span className="shrink-0 text-slate-400">{idx + 1}.</span>
                  <span className="leading-snug break-words">
                    {p.aName} × {p.bName}
                  </span>
                </div>

                <div className="mt-0.5 pl-5 text-[12px] font-extrabold">
                  <span style={{ color: scoreColor(r.score) }}>
                    {r.score.toFixed(2)}점
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
