import React from "react";

import { getCompatScore, axisDiffCount } from "@/lib/mbtiCompat";
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

type ChemSummary = {
  dist: Record<ChemType, number>;
  byType: Record<ChemType, PairRow[]>;
  headline: string;      // 상단 한 줄(짧게)
  tag: string;           // 모임 타입 뱃지용
  profile: string;       // “우리 모임은 …” 한 문장
  friction: string[];    // 자주 부딪히는 포인트 3개
  scenes: string[];      // 실제 장면 6개
};

function summarizeChemTypesDetailed(pairs: PairRow[]): ChemSummary {
  const dist: Record<ChemType, number> = { STABLE: 0, COMPLEMENT: 0, SPARK: 0, EXPLODE: 0 };
  const byType: Record<ChemType, PairRow[]> = { STABLE: [], COMPLEMENT: [], SPARK: [], EXPLODE: [] };

  if (pairs.length === 0) {
    return {
      dist,
      byType,
      headline: "케미 리포트를 보려면 멤버가 2명 이상 필요해요.",
      tag: "📝 입력 필요",
      profile: "멤버를 추가하면 우리 모임의 분위기와 실제 상황 예시가 자동으로 생성돼요.",
      friction: [],
      scenes: [],
    };
  }

  for (const p of pairs) {
    const r = getCompatScore(p.aId, p.aMbti, p.bId, p.bMbti);
    const t = classifyChemType(p.aMbti, p.bMbti, r.scoreInt);
    dist[t]++;
    byType[t].push(p);
  }

  const total = pairs.length;
  const pct = (t: ChemType) => Math.round((dist[t] / total) * 100);
  const stablePct = pct("STABLE");
  const complementPct = pct("COMPLEMENT");
  const sparkPct = pct("SPARK");
  const explodePct = pct("EXPLODE");

  const sorted = (Object.keys(dist) as ChemType[]).sort((a, b) => dist[b] - dist[a]);
  const top = sorted[0];
  const second = sorted[1] ?? top;

  // 위험도 텍스트(짧게)
  const riskLabel =
    explodePct >= 45 ? "☢️ 위험 높음" :
    explodePct >= 30 ? "🧨 주의 필요" :
    explodePct >= 18 ? "⚠️ 가끔 삐걱" :
    "🌿 안정적";

  const tag = `${chemLabel(top)} 중심 · ${riskLabel}`;

  // 모임 프로필(한 문장)
  const profile = (() => {
    if (explodePct >= 40) {
      return "우리 모임은 말투나 해석이 엇갈리면 서운함이 빠르게 쌓일 수 있는 타입의 모임이에요.";
    }
    if (sparkPct >= 45 && explodePct < 25) {
      return "우리 모임은 텐션이 잘 붙고 재밌지만, 취향과 기준이 자주 갈리는 타입의 모임이에요.";
    }
    if (stablePct >= 50 && explodePct < 20) {
      return "우리 모임은 같이 있어도 편하고, 큰 이벤트 없이도 꾸준히 이어지는 타입의 모임이에요.";
    }
    if (complementPct >= 45 && explodePct < 25) {
      return "우리 모임은 서로 빈칸을 잘 채워주고, 역할이 맞물리면 결과가 좋아지는 타입의 모임이에요.";
    }

    const key = `${top}-${second}`;
    if (key === "STABLE-SPARK") return "우리 모임은 기본은 편한데, 한 번 시동 걸리면 대화가 엄청 재밌어지는 타입의 모임이에요.";
    if (key === "STABLE-COMPLEMENT") return "우리 모임은 편안함이 기본이고, 자연스럽게 누가 뭘 맡을지가 정리되는 타입의 모임이에요.";
    if (key === "COMPLEMENT-SPARK") return "우리 모임은 역할도 갈리고 텐션도 좋아서, 잘 굴러가면 정말 강해지는 타입의 모임이에요.";
    if (key === "SPARK-EXPLODE") return "우리 모임은 재밌지만 컨디션이 나쁜 날에는 오해가 쉽게 생길 수 있는 타입의 모임이에요.";
    if (key === "COMPLEMENT-EXPLODE") return "우리 모임은 역할 분담이 되면 좋은데, 기여도 체감이 흔들리면 불만이 쌓일 수 있는 타입의 모임이에요.";

    return "우리 모임은 상황에 따라 분위기 색이 바뀌는 혼합형 타입의 모임이에요.";
  })();

  // 분포 기반 마찰 포인트(3개만)
  const friction: string[] = (() => {
    if (explodePct >= 30) {
      return [
        "단톡 말투/답장 속도 때문에 감정 해석이 갈릴 수 있어요.",
        "정산·지각·불참 같은 현실 이슈가 서운함으로 번지기 쉬워요.",
        "서운함을 쌓아두면 다음 만남에서 갑자기 어색해질 수 있어요.",
      ];
    }
    if (sparkPct >= 35) {
      return [
        "장소·메뉴·여행처럼 선택지가 많을 때 의견이 확 갈릴 수 있어요.",
        "즉흥 vs 계획, 속도 차이로 답답함이 생길 수 있어요.",
        "드립/농담 수위가 사람마다 달라서 피곤한 날엔 민감해질 수 있어요.",
      ];
    }
    if (stablePct >= 40) {
      return [
        "대부분은 편하지만, 연락 템포 차이로 오해가 가끔 생길 수 있어요.",
        "‘다 괜찮아’가 많아지면 결국 한 사람이 정리 담당이 될 수 있어요.",
        "조용한 사람이 생기면 ‘기분이 안 좋나?’로 해석될 수 있어요.",
      ];
    }
    if (complementPct >= 40) {
      return [
        "역할이 자연스럽게 고정되면 한쪽만 바빠질 수 있어요.",
        "기여도 체감이 달라서 ‘왜 나만 하는 느낌이지?’가 생길 수 있어요.",
        "디테일 vs 큰 그림으로 얘기할 때 서로 답답해질 수 있어요.",
      ];
    }
    return [
      "약속·정산·장소 선택 같은 현실 이슈에서 스타일 차이가 드러날 수 있어요.",
      "직설/완곡 말투 차이로 의도 확인이 없으면 오해가 생길 수 있어요.",
      "컨디션에 따라 텐션이 출렁이는 날이 있을 수 있어요.",
    ];
  })();

  // 실제 장면(최대 6개)
  const scenes: string[] = (() => {
    const base = [
      "단톡에서 ‘ㅇㅇ/ㅇㅋ’ 같은 짧은 답장을 두고, 담백함 vs 차가움으로 반응이 갈릴 수 있어요.",
      "장소 정할 때 ‘아무 데나’가 진짜 아무 데나인 사람과 추천을 기대하는 사람이 섞여서 결정이 늦어질 수 있어요.",
      "정산이 며칠 밀리면 ‘바쁜가 보다’와 ‘신경 안 쓰나?’로 해석이 갈릴 수 있어요.",
      "여행에서 ‘일단 가서 정하자’와 ‘예약부터 하자’가 부딪혀 초반 분위기가 흔들릴 수 있어요.",
      "지각을 가볍게 넘기는 사람과 기다림에 예민한 사람이 섞이면 불편함이 쌓일 수 있어요.",
      "농담이 잘 통하는 날도 있지만, 피곤한 날엔 같은 농담이 부담으로 들릴 수 있어요.",
    ];

    // 폭발형 높으면 더 현실적으로 교체
    if (explodePct >= 30) {
      return [
        "단톡에서 읽고 답이 늦어지면, 어떤 사람은 ‘바쁜가 보다’지만 어떤 사람은 ‘일부러 무시하나?’로 받아들일 수 있어요.",
        "농담으로 던진 말이 특정 사람에게는 ‘비꼼’으로 남아서 다음 만남에서 어색해질 수 있어요.",
        "정산 이야기가 나왔을 때, 어떤 사람은 원칙을 말하고 어떤 사람은 ‘왜 그걸로 분위기 깨냐’로 받아들일 수 있어요.",
        "지각한 사람은 대수롭지 않게 넘기는데, 기다린 사람은 그날 내내 기분이 가라앉아 있을 수 있어요.",
        "불참이 잦은 사람이 생기면 ‘사정’과 ‘성의’ 사이에서 해석이 갈려 분위기가 딱딱해질 수 있어요.",
        "한 번 서운해지면, 같은 말도 다르게 들리는 구간이 생길 수 있어요.",
      ];
    }

    return base;
  })();

  const headline = tag; // 상단은 짧게 뱃지 느낌으로

  return { dist, byType, headline, tag, profile, friction, scenes };
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




export default function ChemReportSection({ pairs }: Props) {
  const chem = summarizeChemTypesDetailed(pairs);
  const totalPairs = pairs.length || 1;

  return (
    <>

        {pairs.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">
            랭킹을 보려면 MBTI를 입력한 멤버가 2명 이상 필요해요.
          </p>
        ) : (
          <>
            {/* ✅ 상단 요약(가독성 개선) */}
            <div className="mt-3 space-y-2">
              {/* 뱃지 */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-white/70 px-2.5 py-1 text-[11px] font-extrabold text-slate-700 ring-1 ring-black/5">
                  {chem.tag}
                </span>
              </div>

              {/* 모임 프로필 */}
              <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">
                <div className="text-[11px] font-extrabold text-slate-500">모임 성격</div>
                <div className="mt-1 text-xs font-extrabold text-slate-800 leading-5">
                  {chem.profile}
                </div>
              </div>

              {/* 부딪히는 포인트(칩 형태) */}
              {chem.friction?.length ? (
                <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">
                  <div className="text-[11px] font-extrabold text-slate-500">자주 흔들리는 포인트</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {chem.friction.slice(0, 3).map((t: string, i: number) => (
                      <span
                        key={i}
                        className="rounded-2xl bg-slate-50 px-2.5 py-1.5 text-[11px] font-bold text-slate-700 ring-1 ring-black/5"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* 실제 장면(번호 카드) */}
              {chem.scenes?.length ? (
                <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">
                  <div className="text-[11px] font-extrabold text-slate-500">실제로 자주 나오는 장면</div>
                  <ul className="mt-2 space-y-2">
                    {chem.scenes.slice(0, 6).map((s: string, i: number) => (
                      <li key={i} className="flex gap-2 rounded-xl bg-white/70 px-3 py-2 ring-1 ring-black/5">
                        <div className="mt-[1px] h-5 w-5 shrink-0 rounded-full bg-slate-100 text-[11px] font-extrabold text-slate-600 flex items-center justify-center ring-1 ring-black/5">
                          {i + 1}
                        </div>
                        <div className="text-[12px] leading-5 text-slate-700">{s}</div>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
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

      </>
  );
}
