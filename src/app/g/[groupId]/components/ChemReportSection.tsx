import React from "react";

import { getCompatScore } from "@/lib/mbtiCompat";
import { levelFromScore } from "@/lib/mbtiCompat";

type JudgeStyle = "LOGIC" | "PEOPLE";
type InfoStyle = "IDEA" | "FACT";

export type PairRow = {
  aId: string; aName: string; aMbti: string;
  bId: string; bName: string; bMbti: string;
  score: number;
  micro?: number; // ✅ 정렬/세분화용(표시는 안 함)

  aJudge?: JudgeStyle; aInfo?: InfoStyle;
  bJudge?: JudgeStyle; bInfo?: InfoStyle;
};

type ChemType = "STABLE" | "COMPLEMENT" | "SPARK" | "EXPLODE";

type Props = {
  pairs: PairRow[];
  best3: PairRow[];
  worst3: PairRow[];
};

type Level = 1 | 2 | 3 | 4 | 5;

const LEVEL_META: Record<Level, { label: string; color: string }> = {
  5: { label: "찰떡궁합", color: "#1E88E5" },
  4: { label: "합좋은편", color: "#00C853" },
  3: { label: "그럭저럭", color: "#FDD835" },
  2: { label: "조율필요", color: "#FB8C00" },
  1: { label: "위험", color: "#E53935" },
};

type RankBadge = { title: string; cls: string };

function chemRankBadge(t: ChemType, rankIdx: number): RankBadge | null {
  // rankIdx: 0=1위 ... 4=5위
  if (rankIdx < 0 || rankIdx > 4) return null;

  // ✅ “화려함”은 1위>2위>3위>4위>5위 순
  // - 1위: 그라데이션 느낌(텍스트만으로는 제한 → 굵기/색/트래킹으로 최대)
  // - 2위: 진한 색 + bold
  // - 3위: 중간 색
  // - 4~5위: 톤 다운

  const pick = (titles: [string, string, string, string, string], cls: [string, string, string, string, string]) => ({
    title: titles[rankIdx],
    cls: cls[rankIdx],
  });

  if (t === "STABLE") {
    return pick(
      ["완벽 호흡 듀오", "리듬 맞춘 파트너", "안정 운영팀", "무난한 합", "잔잔한 궁합"],
      [
        "text-sky-700 font-extrabold tracking-tight",
        "text-sky-600 font-extrabold",
        "text-sky-500 font-bold",
        "text-sky-500/80 font-semibold",
        "text-slate-500 font-semibold",
      ]
    );
  }

  if (t === "COMPLEMENT") {
    return pick(
      ["빈칸 완성 듀오", "역할 분담 장인", "서로 보완 팀", "맞물림 좋은 조합", "보완형 후보"],
      [
        "text-emerald-700 font-extrabold tracking-tight",
        "text-emerald-600 font-extrabold",
        "text-emerald-500 font-bold",
        "text-emerald-500/80 font-semibold",
        "text-slate-500 font-semibold",
      ]
    );
  }

  if (t === "SPARK") {
    return pick(
      ["텐션 폭발 듀오", "불꽃 튀는 시너지", "자극 주고받는 조합", "재미는 보장", "스파크 후보"],
      [
        "text-amber-700 font-extrabold tracking-tight",
        "text-amber-600 font-extrabold",
        "text-amber-500 font-bold",
        "text-amber-500/80 font-semibold",
        "text-slate-500 font-semibold",
      ]
    );
  }

  // EXPLODE
  return pick(
    ["지뢰밭 1순위", "폭발 주의 조합", "말투 조심 듀오", "피로 누적 조합", "주의 후보"],
    [
      "text-rose-700 font-extrabold tracking-tight",
      "text-rose-600 font-extrabold",
      "text-rose-500 font-bold",
      "text-rose-500/80 font-semibold",
      "text-slate-500 font-semibold",
    ]
  );
}

function chemRankPillCls(t: ChemType, rankIdx: number) {
  // ✅ 칭호 옆 “뱃지” 배경도 같이 화려하게
  const strong = rankIdx === 0 ? "ring-1 ring-black/10" : "ring-1 ring-black/5";
  if (t === "STABLE") {
    return `${strong} ${rankIdx === 0 ? "bg-sky-500/15 text-sky-800" : "bg-sky-500/10 text-sky-700"}`;
  }
  if (t === "COMPLEMENT") {
    return `${strong} ${rankIdx === 0 ? "bg-emerald-500/15 text-emerald-800" : "bg-emerald-500/10 text-emerald-700"}`;
  }
  if (t === "SPARK") {
    return `${strong} ${rankIdx === 0 ? "bg-amber-500/18 text-amber-900" : "bg-amber-500/10 text-amber-700"}`;
  }
  return `${strong} ${rankIdx === 0 ? "bg-rose-500/15 text-rose-800" : "bg-rose-500/10 text-rose-700"}`;
}

function scoreColor(score: number) {
  return LEVEL_META[levelFromScore(score)].color;
}

function chemLabel(t: ChemType) {
  switch (t) {
    case "STABLE": return "🌊 안정형";
    case "COMPLEMENT": return "🧩 보완형";
    case "SPARK": return "⚡ 스파크형";
    case "EXPLODE": return "🧨 폭발형";
  }
}

function chemTypeComment(t: ChemType) {
  switch (t) {
    case "STABLE": return "대화 템포만 맞추면 오래 편한 조합이 많아요.";
    case "COMPLEMENT": return "역할 분배만 되면 팀플처럼 굴러가요.";
    case "SPARK": return "친해지기 빠르지만 전제 차이에서 삐끗할 수 있어요.";
    case "EXPLODE": return "피곤한 날엔 말투 하나로 분위기가 갈릴 수 있어요.";
  }
}

function chemTheme(t: ChemType) {
  switch (t) {
    case "STABLE":
      return { leftBar: "bg-sky-400", accent: "text-sky-700" };
    case "COMPLEMENT":
      return { leftBar: "bg-emerald-400", accent: "text-emerald-700" };
    case "SPARK":
      return { leftBar: "bg-amber-400", accent: "text-amber-700" };
    case "EXPLODE":
      return { leftBar: "bg-rose-400", accent: "text-rose-700" };
  }
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

function summarizeChemTypesDetailed(pairs: PairRow[]) {
  const dist: Record<ChemType, number> = { STABLE: 0, COMPLEMENT: 0, SPARK: 0, EXPLODE: 0 };
  const byType: Record<ChemType, PairRow[]> = { STABLE: [], COMPLEMENT: [], SPARK: [], EXPLODE: [] };

  if (pairs.length === 0) {
    return {
      dist,
      byType,
      headline: "케미 리포트를 보려면 MBTI 입력 멤버가 2명 이상 필요해요.",
      tip: "MBTI를 입력하면 자동으로 ‘안정/보완/스파크/폭발’ 분포와 예시 조합이 보여요.",
    };
  }

  let sum = 0;
  for (const p of pairs) {
    sum += p.score;
    const t = classifyChemType(p.aMbti, p.bMbti, p.score);
    dist[t]++;
    byType[t].push(p);
  }

  const avg = Math.round(sum / pairs.length);
  const best = (Object.keys(dist) as ChemType[]).sort((x, y) => dist[y] - dist[x])[0];

  const headline = (() => {
    if (avg >= 72) return `전체 평균이 ${avg}점이에요. 전체적으로 안정적으로 굴러가는 편이에요.`;
    if (avg >= 62) return `전체 평균이 ${avg}점이에요. 무난하지만 스파크가 가끔 튈 수 있어요.`;
    if (avg >= 54) return `전체 평균이 ${avg}점이에요. 조율 없으면 갈등이 자주 생길 수 있어요.`;
    return `전체 평균이 ${avg}점이에요. 방치하면 폭발형이 자주 보일 수 있어요.`;
  })();

  const tip = (() => {
    if (best === "STABLE") return "편한 조합이 많아요. 속도만 맞추면 됩니다.";
    if (best === "COMPLEMENT") return "역할 분배하면 효율이 확 올라가요.";
    if (best === "SPARK") return "전제부터 맞추면 급싸를 많이 줄일 수 있어요.";
    return "짧고 명확하게 말하는 게 안전해요.";
  })();

  return { dist, byType, headline, tip };
}


function chemComboTitle(t: ChemType, a: string, b: string, score: number) {
  const diff = axisDiffCount(a, b);
  // 가벼운 “조합 별명” — 너무 길지 않게
  if (t === "STABLE") {
    if (diff <= 1) return "호흡이 맞는 팀플러";
    if (diff === 2) return "다른데 편한 조합";
    return "안정적인 다름";
  }
  if (t === "COMPLEMENT") {
    if (diff >= 3) return "빈칸 메우는 듀오";
    return "역할 분담 듀오";
  }
  if (t === "SPARK") {
    if (diff >= 3) return "자극 주고받는 듀오";
    return "텐션 스파크";
  }
  // EXPLODE
  if (score < 45) return "지뢰밭 조합";
  return "말투 주의 조합";
}

function top5RankSlots(list: PairRow[], t: ChemType) {
  // ✅ micro는 무조건 lib(getCompatScore) 기준으로 통일
  const withScore = list.map((p) => {
    const r = getCompatScore(p.aId, p.aMbti, p.bId, p.bMbti);
    return {
      ...p,
      scoreInt: r.scoreInt, // ✅ 정수(분류/레벨/1차정렬 기준)
      micro: r.score,       // ✅ 소수점(표시/동점깨기)
    };
  });

  // ✅ 정렬 규칙: EXPLODE는 낮은 scoreInt 우선, 나머지는 높은 scoreInt 우선
  const sorted = [...withScore].sort((a, b) => {
    const aInt = (a as any).scoreInt ?? a.score;
    const bInt = (b as any).scoreInt ?? b.score;

    const aMicro = a.micro ?? aInt;
    const bMicro = b.micro ?? bInt;

    if (t === "EXPLODE") {
      if (aInt !== bInt) return aInt - bInt;      // 낮은 정수점수 우선
      return aMicro - bMicro;                     // 동점이면 micro 낮은쪽 우선
    }

    if (aInt !== bInt) return bInt - aInt;        // 높은 정수점수 우선
    return bMicro - aMicro;                       // 동점이면 micro 높은쪽 우선
  });

  // ✅ 공동순위 묶기: scoreInt가 같고 micro가 거의 같을 때만
  const EPS = 0.01;

  const slots: Array<{ scoreInt: number; microKey: number; items: PairRow[] }> = [];
  for (const p of sorted) {
    const pInt = (p as any).scoreInt ?? p.score;
    const mk = p.micro ?? pInt;

    const last = slots[slots.length - 1];
    if (last && last.scoreInt === pInt && Math.abs(last.microKey - mk) <= EPS) {
      last.items.push(p);
    } else {
      slots.push({ scoreInt: pInt, microKey: mk, items: [p] });
    }
  }

  // TOP 5 슬롯
  return slots.slice(0, 5);
}




export default function ChemReportSection({ pairs, best3, worst3 }: Props) {
  const chem = summarizeChemTypesDetailed(pairs);
  const totalPairs = pairs.length || 1;

  return (
    <section className="mt-6">
      <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
        <div className="flex items-center justify-between">
          <div className="text-sm font-extrabold">🏆 케미 리포트</div>
        </div>

        {/* ✅ 상단 요약 */}
        <div className="mt-3 rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
          <div className="text-xs font-extrabold text-slate-800">{chem.headline}</div>
          <p className="mt-1 text-xs text-slate-600">{chem.tip}</p>
        </div>

        {pairs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            랭킹을 보려면 MBTI를 입력한 멤버가 2명 이상 필요해요.
          </p>
        ) : (
          <>
            {/* ✅ 랭킹(best/worst) */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {/* LEFT: BEST */}
              <div className="min-w-0">
                <div className="mb-2 flex items-center gap-2">
                  <span className="text-[11px] font-extrabold text-[#1E88E5]">🔥 최고</span>
                  <span className="text-[11px] text-slate-400">TOP 3</span>
                </div>

                <ul className="space-y-2">
                  {best3.map((p, idx) => {
                    const r = getCompatScore(p.aId, p.aMbti, p.bId, p.bMbti); // ✅ micro 포함

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
                          style={{ color: scoreColor(r.score) }} // ✅ micro 기준 색
                        >
                          {r.score.toFixed(2)} {/* ✅ micro 표시 */}
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
                          style={{ color: scoreColor(r.score) }} // ✅ micro 기준 색
                        >
                          {r.score.toFixed(2)}
                        </span>
                      </li>
                    );
                  })}

                </ul>
              </div>
            </div>

            {/* ✅ 타입(안정/보완/스파크/폭발) 리스트 */}
            <div className="mt-3 space-y-3">
              {(["STABLE", "COMPLEMENT", "SPARK", "EXPLODE"] as ChemType[]).map((t) => {
                const th = chemTheme(t);
                const list = (chem.byType?.[t] ?? []).slice();

                const rankSlots = top5RankSlots(list, t);

                const percent = Math.round(((chem.dist[t] ?? 0) / totalPairs) * 100);

                return (
                <div
                    key={t}
                    className={[
                    "relative overflow-hidden rounded-2xl bg-white/70 p-3",
                    "ring-1 ring-black/5",
                    ].join(" ")}
                >
                    <div className={`absolute left-0 top-0 h-full w-1 ${th.leftBar}`} />

                    <div className="flex items-start justify-between gap-2 pl-2">
                    <div className="min-w-0">
                        <div className={`text-xs font-extrabold truncate ${th.accent}`}>
                        {chemLabel(t)}
                        </div>
                        <div className="mt-0.5 text-[11px] text-slate-500">
                        {chemTypeComment(t)}
                        </div>
                    </div>
                    </div>

                    <div className="mt-2 pl-2">
                    <div className="flex items-center justify-between">
                        <div className="text-[11px] font-bold text-slate-500">
                        {chem.dist[t]}개 <span className="text-slate-300">·</span> {percent}%
                        </div>
                        <div className="text-[11px] font-bold text-slate-400">
                        전체 조합 {pairs.length}개 중
                        </div>
                    </div>

                    <div className="mt-2 h-2 w-full rounded-full bg-slate-200/80">
                        <div
                        className={`h-2 rounded-full ${th.leftBar}`}
                        style={{ width: `${percent}%` }}
                        />
                    </div>
                    </div>

                    <div className="mt-3 pl-2">
                    {rankSlots.length > 0 ? (
                        <ul className="divide-y divide-black/5 overflow-hidden rounded-xl bg-white/60 ring-1 ring-black/5">
                        {rankSlots.map((slot, rankIdx) => {
                            const badge = chemRankBadge(t, rankIdx);

                            return (
                            <li
                                key={`${t}-rank-${rankIdx}-${slot.scoreInt}`}
                                className="px-3 py-2"
                            >
                                {/* 헤더: 순위 + 칭호 + 점수 */}
                                <div className="flex items-center justify-between gap-2">
                                <div className="min-w-0 flex items-center gap-2">
                                    <span className="w-4 shrink-0 text-[11px] font-extrabold text-slate-400 text-center">
                                        {rankIdx + 1}
                                    </span>

                                    {/* ✅ 순위 칭호(타입별 프리셋) */}
                                    {badge && (
                                        <span className={badge.cls}>
                                        {badge.title}
                                        </span>
                                    )}

                                </div>
                                <span
                                  className="shrink-0 text-[11px] font-extrabold"
                                  style={{ color: scoreColor(slot.microKey) }} // ✅ microKey 기준 색
                                >
                                  {slot.microKey.toFixed(2)}점
                                </span>
                                </div>

                                {/* 본문: 공동이면 여러 줄로 */}
                                <div className="mt-1 space-y-0.5">
                                    {slot.items.map((p) => (
                                        <div
                                        key={`${t}-${p.aId}-${p.bId}`}
                                        className="flex items-center gap-1.5 text-[11px]"
                                        title={`${p.aMbti} × ${p.bMbti}`}
                                        >
                                        {/* ✅ 순위 숫자 자리와 동일한 폭의 더미 */}
                                        <span className="w-4 shrink-0" />

                                        <span className="truncate font-extrabold text-slate-800">
                                            {p.aName} × {p.bName}
                                        </span>

                                        <span className="ml-auto shrink-0 font-bold text-slate-500">
                                            {p.aMbti}/{p.bMbti}
                                        </span>
                                        </div>
                                    ))}
                                    </div>

                            </li>
                            );
                        })}
                        </ul>
                    ) : (
                        <div className="rounded-xl bg-white/60 px-3 py-3 ring-1 ring-black/5">
                        <div className="text-[11px] text-slate-500">
                            아직 이 타입으로 분류되는 조합이 없어요.
                        </div>
                        </div>
                    )}
                    </div>
                </div>
                );


              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
