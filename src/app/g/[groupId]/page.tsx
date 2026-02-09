import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InviteActions from "@/components/InviteActions";
import RememberGroupClient from "@/components/RememberGroupClient";
import GraphServer from "./GraphServer";
import { calcCompatScore } from "@/lib/mbtiCompat";
import { unstable_cache } from "next/cache";

import Link from "next/link";
import { Suspense } from "react";

const isValidMbti = (s?: string | null) => /^[EI][NS][TF][JP]$/i.test((s ?? "").trim());

type PairRow = {
      aId: string; aName: string; aMbti: string;
      bId: string; bName: string; bMbti: string;
      score: number;
    };


/** ✅ 1) MBTI 분포 분석 */
function summarizeMbtiDistribution(mbtis: string[]) {
  const cnt = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
  for (const m of mbtis) {
    const t = m.trim().toUpperCase();
    if (!isValidMbti(t)) continue;
    cnt[t[0] as "E" | "I"]++;
    cnt[t[1] as "N" | "S"]++;
    cnt[t[2] as "T" | "F"]++;
    cnt[t[3] as "J" | "P"]++;
  }

  const axisLine = (a: keyof typeof cnt, b: keyof typeof cnt, labelA: string, labelB: string) => {
    const A = cnt[a], B = cnt[b];
    const total = A + B || 1;
    const dom = A === B ? null : (A > B ? a : b);
    const pct = (x: number) => Math.round((x / total) * 100);

    return {
      a: { key: a, label: labelA, v: A, pct: pct(A) },
      b: { key: b, label: labelB, v: B, pct: pct(B) },
      dom,
    };
  };

  const ei = axisLine("E", "I", "E(외향)", "I(내향)");
  const ns = axisLine("N", "S", "N(직관)", "S(감각)");
  const tf = axisLine("T", "F", "T(사고)", "F(감정)");
  const jp = axisLine("J", "P", "J(판단)", "P(인식)");

  // 한줄 총평(가벼운 위트, 밈X)
  const vibe = (() => {
    const tags: string[] = [];
    if (ei.dom === "E") tags.push("대화가 잘 붙는 편");
    if (ei.dom === "I") tags.push("각자 페이스를 존중하는 편");
    if (ns.dom === "N") tags.push("아이디어가 자주 튀는 방");
    if (ns.dom === "S") tags.push("현실적인 얘기에서 강한 방");
    if (tf.dom === "T") tags.push("팩트/결론이 빠른 편");
    if (tf.dom === "F") tags.push("분위기/공감이 우선인 편");
    if (jp.dom === "J") tags.push("정리 담당이 자연히 생김");
    if (jp.dom === "P") tags.push("즉흥에도 잘 굴러감");

    if (tags.length === 0) return "균형 잡힌 구성이라 어떤 주제든 무난하게 굴러가요.";
    const pick = tags.slice(0, 2).join(" · ");
    return `${pick}. (장점은 크고, 단점은 가끔 ‘정리’에서만 나와요.)`;
  })();

  return { cnt, ei, ns, tf, jp, vibe };
}

/** ✅ 2) 역할 추천 (방 전체) */
type RoleKey = "STRATEGY" | "VIBE" | "EXEC" | "ORGANIZE" | "MEDIATOR";

function roleLabel(r: RoleKey) {
  switch (r) {
    case "STRATEGY": return "🧠 전략 담당";
    case "VIBE": return "💬 분위기 담당";
    case "EXEC": return "🚀 실행 엔진";
    case "ORGANIZE": return "🗂 정리/결정";
    case "MEDIATOR": return "🧯 중재/조율";
  }
}

function roleTheme(k: RoleKey) {
  switch (k) {
    case "STRATEGY":
      return { card: "bg-white/70 ring-black/5", accent: "text-fuchsia-700", leftBar: "bg-fuchsia-400" };
    case "VIBE":
      return { card: "bg-white/70 ring-black/5", accent: "text-sky-700", leftBar: "bg-sky-400" };
    case "EXEC":
      return { card: "bg-white/70 ring-black/5", accent: "text-emerald-700", leftBar: "bg-emerald-400" };
    case "ORGANIZE":
      return { card: "bg-white/70 ring-black/5", accent: "text-amber-700", leftBar: "bg-amber-400" };
    case "MEDIATOR":
      return { card: "bg-white/70 ring-black/5", accent: "text-rose-700", leftBar: "bg-rose-400" };
  }
}

function chemTheme(t: ChemType) {
  switch (t) {
    case "STABLE":
      return { leftBar: "bg-sky-400", accent: "text-sky-700", chip: "bg-sky-500/10 text-sky-700" };
    case "COMPLEMENT":
      return { leftBar: "bg-emerald-400", accent: "text-emerald-700", chip: "bg-emerald-500/10 text-emerald-700" };
    case "SPARK":
      return { leftBar: "bg-amber-400", accent: "text-amber-700", chip: "bg-amber-500/10 text-amber-700" };
    case "EXPLODE":
      return { leftBar: "bg-rose-400", accent: "text-rose-700", chip: "bg-rose-500/10 text-rose-700" };
  }
}



function roleRankBadge(role: RoleKey, rank: number) {
  // rank: 0=1등, 1=2등, 2=3등, 3=4등, 4=5등...

  if (rank >= 4) {
    return null; // ✅ 5등부터는 칭호 없음
  }

  const pick = (
    titles: [string, string, string, string],
    cls: [string, string, string, string]
  ) => {
    return { title: titles[rank], cls: cls[rank] };
  };

  if (role === "STRATEGY") {
    return pick(
      ["전략 설계자", "구조 장인", "아이디어 브레인", "전략 보조"],
      [
        "text-fuchsia-700 font-extrabold",
        "text-fuchsia-600 font-bold",
        "text-fuchsia-500",
        "text-fuchsia-400",
      ]
    );
  }

  if (role === "ORGANIZE") {
    return pick(
      ["정리왕", "결정 장인", "체계 관리자", "보조 정리러"],
      [
        "text-amber-700 font-extrabold",
        "text-amber-600 font-bold",
        "text-amber-500",
        "text-amber-400",
      ]
    );
  }

  if (role === "VIBE") {
    return pick(
      ["분위기 메이커", "공감 리더", "대화 촉진자", "소통 보조"],
      [
        "text-sky-700 font-extrabold",
        "text-sky-600 font-bold",
        "text-sky-500",
        "text-sky-400",
      ]
    );
  }

  if (role === "EXEC") {
    return pick(
      ["실행 엔진", "행동 대장", "추진 담당", "참여형"],
      [
        "text-emerald-700 font-extrabold",
        "text-emerald-600 font-bold",
        "text-emerald-500",
        "text-emerald-400",
      ]
    );
  }

  // MEDIATOR
  return pick(
    ["평화 유지군", "조율 장인", "감정 균형자", "중재 보조"],
    [
      "text-rose-700 font-extrabold",
      "text-rose-600 font-bold",
      "text-rose-500",
      "text-rose-400",
    ]
  );
}


function roleEmptyMessage(role: RoleKey) {
  switch (role) {
    case "STRATEGY":
      return "큰 방향을 잡는 사람이 없어서, 회의가 길어질 수 있어요.";
    case "VIBE":
      return "분위기를 잡아주는 사람이 없어서, 말이 조금 딱딱해질 수 있어요.";
    case "EXEC":
      return "실행으로 밀어붙일 사람이 없어서, 아이디어가 멈출 수 있어요.";
    case "ORGANIZE":
      return "정리/결정 담당이 없어서, 결론이 미뤄질 수 있어요.";
    case "MEDIATOR":
      return "중재해줄 사람이 없어서, 작은 오해가 오래 갈 수 있어요.";
  }
}


function pickRolesForGroup(
  members: { nickname: string; mbti: string }[]
) {
  // 아주 가벼운 휴리스틱(인지기능까지 안가도 충분히 납득감)
  const valid = members
  .map((m) => ({
    name: m.nickname,
    mbti: m.mbti.trim().toUpperCase(),
  }))
  .filter((m) => isValidMbti(m.mbti));


  const scoreRole = (mbti: string): RoleKey[] => {
    const E = mbti[0] === "E";
    const N = mbti[1] === "N";
    const T = mbti[2] === "T";
    const J = mbti[3] === "J";

    const out: RoleKey[] = [];

    if (N && T) out.push("STRATEGY");
    if (E && (mbti[2] === "F")) out.push("VIBE");
    if (E && (mbti[1] === "S")) out.push("EXEC");
    if (T && J) out.push("ORGANIZE");
    if (!T && J) out.push("MEDIATOR"); // FJ 계열을 중재로

    // 중복 완충
    if (out.length === 0) out.push(E ? "VIBE" : "STRATEGY");
    return out;
  };

  const roleFitScore = (mbti: string, role: RoleKey) => {
    const t = mbti.trim().toUpperCase();
    const E = t[0] === "E";
    const N = t[1] === "N";
    const T = t[2] === "T";
    const J = t[3] === "J";
    const S = t[1] === "S";
    const F = t[2] === "F";

    // 0~100 정도 감각의 가벼운 점수(휴리스틱)
    let s = 50;

    if (role === "STRATEGY") {
      if (N) s += 18;
      if (T) s += 18;
      if (!E) s += 6;     // 집중형 전략 가산
      if (J) s += 6;
    }

    if (role === "VIBE") {
      if (E) s += 18;
      if (F) s += 18;
      if (!T) s += 6;
      if (!J) s += 4;
    }

    if (role === "EXEC") {
      if (E) s += 12;
      if (S) s += 18;
      if (!N) s += 6;
      if (!J) s += 6;     // 즉흥 실행
    }

    if (role === "ORGANIZE") {
      if (J) s += 18;
      if (T) s += 14;
      if (!E) s += 4;
      if (!N) s += 4;
    }

    if (role === "MEDIATOR") {
      if (F) s += 18;
      if (J) s += 12;     // 중재/조율은 기준 세우는 힘도 필요
      if (E) s += 6;
    }

    return Math.max(0, Math.min(100, s));
  };


  const bucket: Record<RoleKey, { name: string; mbti: string; fit: number }[]> = {
    STRATEGY: [],
    VIBE: [],
    EXEC: [],
    ORGANIZE: [],
    MEDIATOR: [],
  };

  for (const m of valid) {
    for (const r of scoreRole(m.mbti)) {
      bucket[r].push({
        name: m.name,
        mbti: m.mbti,
        fit: roleFitScore(m.mbti, r),
      });
    }
  }

  const sorted = (Object.keys(bucket) as RoleKey[])
    .map(k => ({ k, v: bucket[k].length }))
    .sort((a, b) => b.v - a.v);

  const top2 = sorted.slice(0, 2);
  const lacking2 = [...sorted].reverse().slice(0, 2);

  const headline = (() => {
    const [a, b] = top2;
    if (!a) return "구성원이 더 모이면 역할이 더 또렷해져요.";
    if (a.v === 0) return "아직 역할 분포가 얇아요. 더 많은 MBTI 입력이 필요해요.";
    return `이 방은 ${roleLabel(a.k)} 성향이 강하고, ${b ? roleLabel(b.k) : "균형"} 쪽도 같이 있어요.`;
  })();

  const tip = (() => {
    const lack = lacking2[0];
    if (!lack || lack.v > 0) return "역할은 고정이 아니에요. 상황에 따라 바뀌어도 자연스러워요.";
    // 부족 역할이 0명일 때만 살짝 자극
    return `조심 포인트: ${roleLabel(lack.k)}가 비어 있어요. 이 역할을 맡는 사람이 없으면 회의가 길어질 수 있어요.`;
  })();

  const topPick: Record<RoleKey, { name: string; mbti: string; fit: number } | null> = {
    STRATEGY: null,
    VIBE: null,
    EXEC: null,
    ORGANIZE: null,
    MEDIATOR: null,
  };

  (Object.keys(bucket) as RoleKey[]).forEach((k) => {
    if (bucket[k].length === 0) return;
    topPick[k] = [...bucket[k]].sort((a, b) => b.fit - a.fit)[0];
  });

  return { bucket, top2, lacking2, headline, tip, topPick };
}

/** ✅ 3) 케미 타입 분류 (점수 기반 + 약간의 위트) */
type ChemType = "STABLE" | "COMPLEMENT" | "SPARK" | "EXPLODE";

function chemLabel(t: ChemType) {
  switch (t) {
    case "STABLE": return "🌊 안정형";
    case "COMPLEMENT": return "🧩 보완형";
    case "SPARK": return "⚡ 스파크형";
    case "EXPLODE": return "🧨 폭발형";
  }
}

// 점수 + MBTI 축 차이로 가볍게 타입 분류
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

function summarizeChemTypes(pairs: Array<{ aMbti: string; bMbti: string; score: number }>) {
  const dist: Record<ChemType, number> = { STABLE: 0, COMPLEMENT: 0, SPARK: 0, EXPLODE: 0 };
  if (pairs.length === 0) {
    return {
      avg: null as number | null,
      dist,
      headline: "케미 타입을 보려면 MBTI 입력 멤버가 2명 이상 필요해요.",
      tip: "MBTI를 입력하면 자동으로 ‘안정/보완/스파크/폭발’ 분포가 보여요.",
    };
  }

  let sum = 0;
  for (const p of pairs) {
    sum += p.score;
    dist[classifyChemType(p.aMbti, p.bMbti, p.score)]++;
  }
  const avg = Math.round(sum / pairs.length);

  const best = (Object.keys(dist) as ChemType[]).sort((x, y) => dist[y] - dist[x])[0];

  const headline = (() => {
    if (avg >= 72) return `전체 평균이 ${avg}점이에요. 분위기 자체가 꽤 ${chemLabel("STABLE")}에 가까워요.`;
    if (avg >= 62) return `전체 평균이 ${avg}점이에요. 무난하지만 상황 따라 ${chemLabel("SPARK")}가 튈 수 있어요.`;
    if (avg >= 54) return `전체 평균이 ${avg}점이에요. 조율이 없으면 ${chemLabel("SPARK")}가 자주 나올 수 있어요.`;
    return `전체 평균이 ${avg}점이에요. 방치하면 ${chemLabel("EXPLODE")} 구간이 슬쩍 보입니다.`;
  })();

  const tip = (() => {
    if (best === "STABLE") return "이 방은 ‘기본 예의 + 템포만 맞추기’면 오래 편해요.";
    if (best === "COMPLEMENT") return "역할만 잘 나누면 팀플처럼 굴러가요. (정리 담당만 세우면 끝)";
    if (best === "SPARK") return "센 말 나오기 전에 ‘내가 말한 전제’부터 맞추면 싸움이 줄어요.";
    return "농담으로 넘기기 어려운 날이 있어요. 짧고 명확하게 말하는 게 안전해요.";
  })();

  return { avg, dist, headline, tip };
}

function chemTypeComment(t: ChemType) {
  switch (t) {
    case "STABLE": return "기본 예의 + 템포만 맞추면 오래 편해요.";
    case "COMPLEMENT": return "역할만 나누면 팀플처럼 굴러가요.";
    case "SPARK": return "친해지기 빠르지만, 말꼬리에서 불이 붙을 수 있어요.";
    case "EXPLODE": return "피곤한 날엔 ‘말투’ 하나로 분위기 갈릴 수 있어요.";
  }
}

function summarizeChemTypesDetailed(pairs: PairRow[]) {
  const dist: Record<ChemType, number> = { STABLE: 0, COMPLEMENT: 0, SPARK: 0, EXPLODE: 0 };
  const byType: Record<ChemType, PairRow[]> = { STABLE: [], COMPLEMENT: [], SPARK: [], EXPLODE: [] };

  if (pairs.length === 0) {
    return {
      avg: null as number | null,
      dist,
      byType,
      headline: "케미 타입을 보려면 MBTI 입력 멤버가 2명 이상 필요해요.",
      tip: "MBTI를 입력하면 자동으로 ‘안정/보완/스파크/폭발’ 분포와 예시 커플이 보여요.",
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

  return { avg, dist, byType, headline, tip };
}


/** ✅ cached rankings (원본 유지 + pairs도 같이 반환해 3번에 재사용) */
const getRankings = unstable_cache(
  async (groupId: string) => {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });
    if (!group) return null;

    const membersForRank = group.members
      .filter((m) => isValidMbti(m.mbti))
      .map((m) => ({
        id: m.id,
        nickname: m.nickname,
        mbti: (m.mbti ?? "").trim().toUpperCase(),
      }));

    const pairs: PairRow[] = [];
    for (let i = 0; i < membersForRank.length; i++) {
      for (let j = i + 1; j < membersForRank.length; j++) {
        const a = membersForRank[i];
        const b = membersForRank[j];
        pairs.push({
          aId: a.id,
          aName: a.nickname,
          aMbti: a.mbti,
          bId: b.id,
          bName: b.nickname,
          bMbti: b.mbti,
          score: calcCompatScore(a.mbti, b.mbti),
        });
      }
    }

    const best3 = [...pairs].sort((x, y) => y.score - x.score).slice(0, 3);
    const worst3 = [...pairs].sort((x, y) => x.score - y.score).slice(0, 3);

    return { group, best3, worst3, pairs };
  },
  ["group-rankings"],
  { revalidate: 60 }
);

type Level = 1 | 2 | 3 | 4 | 5;

const LEVEL_META: Record<Level, { label: string; color: string }> = {
  5: { label: "찰떡궁합", color: "#1E88E5" },
  4: { label: "합좋은편", color: "#00C853" },
  3: { label: "그럭저럭", color: "#FDD835" },
  2: { label: "조율필요", color: "#FB8C00" },
  1: { label: "위험", color: "#E53935" },
};

function scoreToLevel(score: number): Level {
  if (score >= 75) return 5;
  if (score >= 65) return 4;
  if (score >= 55) return 3;
  if (score >= 45) return 2;
  return 1;
}

function scoreColor(score: number) {
  return LEVEL_META[scoreToLevel(score)].color;
}


export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ groupId: string }>;
  searchParams?: Promise<{ center?: string }>;
}) {
  const { groupId } = await params;
  const sp = (await searchParams) ?? {};
  const centerId = sp.center;

  const pctNum = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
  const fracText = (n: number, total: number) => `${n}/${total}명 (${pctNum(n, total)}%)`;


  const cached = await getRankings(groupId);
  if (!cached) return notFound();

  const { group, best3, worst3, pairs } = cached;

  const count = group.members.length;
  const max = group.maxMembers;
  const ratio = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;

  const center = (centerId ? group.members.find((m) => m.id === centerId) : null) ?? group.members[0];

  // ✅ 추가 콘텐츠 계산(서버에서 한번만)
  const validMbtis = group.members
    .map((m) => (m.mbti ?? "").trim().toUpperCase())
    .filter(isValidMbti);

  const distTotal = validMbtis.length || 1;
  const pctPeople = (n: number) => Math.round((n / distTotal) * 100);
  const fracText2 = (n: number) => `${n}/${distTotal}명 (${pctPeople(n)}%)`;


  const dist = summarizeMbtiDistribution(validMbtis);
  const roles = pickRolesForGroup(
    group.members
      .filter((m) => isValidMbti(m.mbti))
      .map((m) => ({
        nickname: m.nickname,
        mbti: m.mbti ?? "",
      }))
  );

  const chem = summarizeChemTypesDetailed(pairs as PairRow[]);


  const totalPairs = pairs.length || 1;
  const pct = (x: number) => Math.round((x / totalPairs) * 100);

  const MBTI_COLOR: Record<string, string> = {
    E: "#F59E0B",
    I: "#6366F1",
    N: "#8B5CF6",
    S: "#10B981",
    T: "#3B82F6",
    F: "#EC4899",
    J: "#2563EB",
    P: "#F97316",
  };

  return (
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900 pb-24">
      <div className="mx-auto max-w-[760px] px-5 pt-6">
        {/* Top left back */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-2 text-xs font-bold text-slate-700 ring-1 ring-black/5 backdrop-blur hover:bg-white"
          >
            <span aria-hidden>←</span>
            <span>메인으로</span>
          </Link>
        </div>

        {/* Unified top card */}
        <section className="mt-4">
          <div className="rounded-3xl bg-white/70 p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-500">모임</div>
                <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight">
                  {group.name}
                </h1>
                <p className="mt-2 text-sm text-slate-600">
                  현재 <b>{count}명</b> 참여 중 · 최대 <b>{max}명</b>
                </p>
              </div>

              <div className="relative">
                <InviteActions groupId={group.id} />
              </div>
            </div>

            {/* progress */}
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-slate-200/70">
                <div
                  className="h-2 rounded-full bg-[#1E88E5]"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </div>

            {/* actions */}
            <div className="mt-5">
              <Link
                href={`/g/${group.id}/join`}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#1E88E5] text-sm font-extrabold text-white transition-all duration-200 hover:bg-[#1E88E5]/90 active:scale-[0.98]"
              >
                <span aria-hidden>🫶</span>
                <span className="whitespace-nowrap">모임 참여하기</span>
              </Link>
            </div>
          </div>
        </section>

        <Suspense
          fallback={
            <section className="mt-6">
              <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
                <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold">🧭 관계도 로딩 중</div>
                  <div className="text-[11px] text-slate-500">잠깐만요</div>
                </div>

                <div className="mt-3 h-[360px] w-full rounded-2xl bg-white/60 ring-1 ring-black/5 animate-pulse" />
                <p className="mt-2 text-xs text-slate-500">
                  그래프 먼저 준비하고 있어요. 위 콘텐츠는 이미 볼 수 있어요.
                </p>
              </div>
            </section>
          }
        >
          <GraphServer groupId={groupId} centerId={centerId} />
        </Suspense>

        {/* ✅ 케미 리포트 (랭킹 + 타입요약) */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">🏆 케미 리포트</div>
            </div>

            {/* ✅ 상단 요약 (기존 chem.headline/tip 재사용) */}
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
                {/* ✅ 랭킹 (기존 유지) */}
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {/* LEFT: BEST */}
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-[#1E88E5]">🔥 최고</span>
                      <span className="text-[11px] text-slate-400">TOP 3</span>
                    </div>

                    <ul className="space-y-2">
                      {best3.map((p, idx) => (
                        <li
                          key={`best-${p.aId}-${p.bId}`}
                          className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-1.5 ring-1 ring-black/5"
                        >
                          <div className="flex items-center gap-2 min-w-0 text-xs font-extrabold text-slate-800">
                            <span className="text-slate-400">{idx + 1}.</span>
                            <span className="truncate">{p.aName} × {p.bName}</span>
                          </div>
                          {(() => {
                            return (
                              <span
                                className="shrink-0 text-[12px] font-extrabold"
                                style={{ color: scoreColor(p.score) }}
                              >
                                {p.score}
                              </span>
                            );
                          })()}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* RIGHT: WORST */}
                  <div className="min-w-0">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[11px] font-extrabold text-rose-600">🥶 최악</span>
                      <span className="text-[11px] text-slate-400">WORST 3</span>
                    </div>

                    <ul className="space-y-2">
                      {worst3.map((p, idx) => (
                        <li
                          key={`worst-${p.aId}-${p.bId}`}
                          className="flex items-center justify-between rounded-xl bg-white/60 px-3 py-1.5 ring-1 ring-black/5"
                        >
                          <div className="flex items-center gap-2 min-w-0 text-xs font-extrabold text-slate-800">
                            <span className="text-slate-400">{idx + 1}.</span>
                            <span className="truncate">{p.aName} × {p.bName}</span>
                          </div>
                          {(() => {
                            return (
                              <span
                                className="shrink-0 text-[12px] font-extrabold"
                                style={{ color: scoreColor(p.score) }}
                              >
                                {p.score}
                              </span>
                            );
                          })()}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ✅ 타입 요약: 숫자/비율만 깔끔하게 */}
                {pairs.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {(["STABLE", "COMPLEMENT", "SPARK", "EXPLODE"] as ChemType[]).map((t) => {
                      const th = chemTheme(t);
                      const list = (chem.byType?.[t] ?? []).slice();

                      // ✅ 안정/보완/스파크는 높은 점수 쪽, 폭발은 낮은 점수 쪽
                      const picks =
                        t === "EXPLODE"
                          ? list.sort((a, b) => a.score - b.score).slice(0, 4)
                          : list.sort((a, b) => b.score - a.score).slice(0, 4);

                      const totalPairs = pairs.length || 1;
                      const percent = Math.round(((chem.dist[t] ?? 0) / totalPairs) * 100);

                      return (
                        <div
                          key={t}
                          className={[
                            "relative overflow-hidden rounded-2xl bg-white/70 p-3",
                            "ring-1 ring-black/5",
                          ].join(" ")}
                        >
                          {/* left accent bar (역할카드 느낌) */}
                          <div className={`absolute left-0 top-0 h-full w-1 ${th.leftBar}`} />

                          {/* header */}
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

                          {/* meta: count + percent (고급스럽게) */}
                          <div className="mt-2 pl-2">
                            <div className="flex items-center justify-between">
                              <div className="text-[11px] font-bold text-slate-500">
                                {chem.dist[t]}개 <span className="text-slate-300">·</span> {percent}%
                              </div>
                              {/* 옵션: 점 없애고 싶으면 이 줄 자체를 지워도 됨 */}
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

                          {/* body */}
                          <div className="mt-3 pl-2">
                            {picks.length > 0 ? (
                              <ul className="divide-y divide-black/5 overflow-hidden rounded-xl bg-white/60 ring-1 ring-black/5">
                                {picks.map((p, idx) => (
                                  <li
                                    key={`${t}-${p.aId}-${p.bId}`}
                                    className="flex items-center gap-2 px-3 py-2"
                                    title={`${p.aMbti} × ${p.bMbti}`}
                                  >
                                    <span className="w-4 shrink-0 text-[11px] font-extrabold text-slate-400">
                                      {idx + 1}
                                    </span>

                                    <span className="truncate text-xs font-extrabold text-slate-900">
                                      {p.aName} × {p.bName}
                                    </span>

                                    <span className="ml-auto shrink-0 text-[11px] font-bold text-slate-500">
                                      {p.aMbti}/{p.bMbti}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <div className="rounded-xl bg-white/60 px-3 py-3 ring-1 ring-black/5">
                                <div className="text-[11px] text-slate-500">
                                  아직 이 타입으로 분류되는 조합이 없어요.
                                </div>
                              </div>
                            )}

                            {list.length > picks.length && (
                              <div className="mt-2 text-[11px] font-bold text-slate-400">
                                +{list.length - picks.length}조합 더 있음
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}


              </>
            )}
          </div>
        </section>


        {/* ✅ 1) MBTI 분포 */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">📌 모임 MBTI 분포</div>
            </div>

            {validMbtis.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                아직 입력된 MBTI가 없어요. 한 명만 입력해도 분포가 잡히기 시작해요.
              </p>
            ) : (
              <>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { title: "에너지", a: dist.ei.a, b: dist.ei.b },
                    { title: "정보", a: dist.ns.a, b: dist.ns.b },
                    { title: "판단", a: dist.tf.a, b: dist.tf.b },
                    { title: "스타일", a: dist.jp.a, b: dist.jp.b },
                  ].map((row) => (
                    <div key={row.title} className="rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
                      <div className="text-[11px] font-extrabold text-slate-500">{row.title}</div>
                      <div className="mt-2 flex items-center justify-between text-xs font-extrabold">
                        <span
                          className="font-extrabold"
                          style={{ color: MBTI_COLOR[row.a.key] }}
                        >
                          {row.a.label}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: MBTI_COLOR[row.a.key] }}
                        >
                          {fracText2(row.a.v)}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                        <div
                          className="h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${row.a.pct}%`,
                            backgroundColor: MBTI_COLOR[row.a.key],
                          }}
                        />
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs font-extrabold">
                        <span
                          className="font-extrabold"
                          style={{ color: MBTI_COLOR[row.b.key] }}
                        >
                          {row.b.label}
                        </span>
                        <span
                          className="font-semibold"
                          style={{ color: MBTI_COLOR[row.b.key] }}
                        >
                          {fracText2(row.b.v)}
                        </span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                      <div
                        className="h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${row.b.pct}%`,
                          backgroundColor: MBTI_COLOR[row.b.key],
                        }}
                      />
                    </div>

                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
                  <div className="text-xs font-extrabold text-slate-800">한 줄 총평</div>
                  <p className="mt-1 text-xs text-slate-600">{dist.vibe}</p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* ✅ 2) 역할 추천 */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">🎭 모임 역할 추천</div>
            </div>

            {validMbtis.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                MBTI가 들어오면 “이 방은 어떤 역할이 강한지”가 자동으로 잡혀요.
              </p>
            ) : (
              <>
                {/* ✅ Summary card */}
                <div className="mt-3 rounded-2xl bg-white/70 p-3 ring-1 ring-black/5">
                  <div className="text-xs font-extrabold text-slate-900">{roles.headline}</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{roles.tip}</p>
                </div>

                {/* ✅ Role grid cards */}
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {(Object.keys(roles.bucket) as RoleKey[]).map((k) => {
                    const th = roleTheme(k);
                    const list = roles.bucket[k];
                    const pick1 = roles.topPick?.[k];

                    const sorted = list
                      .slice()
                      .sort((a, b) => b.fit - a.fit);

                    return (
                      <div
                        key={k}
                        className={[
                          "relative overflow-hidden rounded-2xl bg-white/70 p-3",
                          "ring-1 ring-black/5",
                        ].join(" ")}
                      >
                        {/* left accent bar */}
                        <div className={`absolute left-0 top-0 h-full w-1 ${th.leftBar}`} />

                        {/* header */}
                        <div className="flex items-start justify-between gap-2 pl-2">
                          <div className="min-w-0">
                            <div className={`text-xs font-extrabold truncate ${th.accent}`}>
                              {roleLabel(k)}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              역할 성향이 비슷한 멤버를 모아봤어요
                            </div>
                          </div>

                          <div className="shrink-0 pl-2 text-[11px] font-bold text-slate-600">
                            {list.length}명
                          </div>
                        </div>

                        {/* 멤버 리스트: 대표는 리스트 안에서만 강조 */}
                        {sorted.length > 0 && (
                          
                          <div className="mt-3 pl-2">
                            <ul className="divide-y divide-black/5 overflow-hidden rounded-xl bg-white/60 ring-1 ring-black/5">
                              {sorted.slice(0, 5).map((m, idx) => {
                                const isTopRank = idx === 0; // ✅ 역할 내 1등만
                                const badge = roleRankBadge(k, idx);

                                return (
                                  <li
                                    key={`${k}-${m.name}-${m.mbti}`}
                                    className={[
                                      "relative flex items-center justify-between px-3 py-2",
                                      isTopRank ? "bg-white/85" : "",
                                    ].join(" ")}
                                    title={`적합도 ${m.fit}`}
                                  >
                                    
                                    <div className="min-w-0 flex items-center gap-2">
                                      <span className="w-4 shrink-0 text-[11px] font-extrabold text-slate-400">
                                        {idx + 1}
                                      </span>

                                      <span className="truncate text-xs font-extrabold text-slate-900">
                                        {m.name}
                                      </span>

                                      <span className="text-slate-300">·</span>

                                      <span className="shrink-0 text-xs font-extrabold text-slate-600">
                                        {m.mbti}
                                      </span>
                                    </div>

                                    {/* ✅ 우측: 1등만 왕관 + 순위 칭호(색은 순위에 따라 점점 화려) */}
                                    <span className="shrink-0 text-[11px]">
                                    {isTopRank && "👑 "}
                                    {badge && (
                                      <span className={badge.cls}>
                                        {badge.title}
                                      </span>
                                    )}
                                  </span>
                                  </li>
                                );
                              })}

                            </ul>

                            {sorted.length > 5 && (
                              <div className="mt-2 text-[11px] font-bold text-slate-400">
                                +{sorted.length - 5}명 더 있음
                              </div>
                            )}
                          </div>
                        )}
                        {sorted.length === 0 && (
                          <div className="mt-3 pl-2">
                            <div className="rounded-xl bg-white/60 px-3 py-3 ring-1 ring-black/5">
                              <div className="text-[11px] font-extrabold text-slate-500">
                                해당 성향 없음
                              </div>
                              <div className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                                {roleEmptyMessage(k)}
                              </div>
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>

              </>
            )}
          </div>
        </section>

        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-5 ring-1 ring-black/5">
            <p className="text-xs leading-relaxed text-slate-500">
              ※ 결과는 재미를 위한 참고용이에요. 관계 판단/결정의 근거로 사용하지 마세요.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
