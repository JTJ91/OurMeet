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

function roleTitleStyled(role: RoleKey, score: number) {
  const base = (
    high: string,
    midHigh: string,
    mid: string,
    low: string
  ) => {
    if (score >= 85) return { cls: `${high} font-extrabold`, crown: true };
    if (score >= 75) return { cls: `${midHigh} font-bold`, crown: false };
    if (score >= 65) return { cls: mid, crown: false };
    if (score >= 55) return { cls: low, crown: false };
    return { cls: "text-slate-400", crown: false };
  };

  /* =========================
     🧠 STRATEGY (보라)
  ========================== */
  if (role === "STRATEGY") {
    const style = base(
      "text-fuchsia-700",
      "text-fuchsia-600",
      "text-fuchsia-500",
      "text-fuchsia-400"
    );

    let title = "감각형";
    if (score >= 85) title = "전략 설계자";
    else if (score >= 75) title = "구조 장인";
    else if (score >= 65) title = "아이디어 브레인";
    else if (score >= 55) title = "전략 보조";

    return { ...style, title };
  }

  /* =========================
     🗂 ORGANIZE (앰버)
  ========================== */
  if (role === "ORGANIZE") {
    const style = base(
      "text-amber-700",
      "text-amber-600",
      "text-amber-500",
      "text-amber-400"
    );

    let title = "즉흥형";
    if (score >= 85) title = "정리왕";
    else if (score >= 75) title = "결정 장인";
    else if (score >= 65) title = "체계 관리자";
    else if (score >= 55) title = "보조 정리러";

    return { ...style, title };
  }

  /* =========================
     💬 VIBE (스카이)
  ========================== */
  if (role === "VIBE") {
    const style = base(
      "text-sky-700",
      "text-sky-600",
      "text-sky-500",
      "text-sky-400"
    );

    let title = "관찰형";
    if (score >= 85) title = "분위기 메이커";
    else if (score >= 75) title = "공감 리더";
    else if (score >= 65) title = "대화 촉진자";
    else if (score >= 55) title = "소통 보조";

    return { ...style, title };
  }

  /* =========================
     🚀 EXEC (에메랄드)
  ========================== */
  if (role === "EXEC") {
    const style = base(
      "text-emerald-700",
      "text-emerald-600",
      "text-emerald-500",
      "text-emerald-400"
    );

    let title = "기획형";
    if (score >= 85) title = "실행 엔진";
    else if (score >= 75) title = "행동 대장";
    else if (score >= 65) title = "추진 담당";
    else if (score >= 55) title = "참여형";

    return { ...style, title };
  }

  /* =========================
     🧯 MEDIATOR (로즈)
  ========================== */
  if (role === "MEDIATOR") {
    const style = base(
      "text-rose-700",
      "text-rose-600",
      "text-rose-500",
      "text-rose-400"
    );

    let title = "직설형";
    if (score >= 85) title = "평화 유지군";
    else if (score >= 75) title = "조율 장인";
    else if (score >= 65) title = "감정 균형자";
    else if (score >= 55) title = "중재 보조";

    return { ...style, title };
  }

  return { cls: "text-slate-400", crown: false, title: "" };
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

    type PairRow = {
      aId: string; aName: string; aMbti: string;
      bId: string; bName: string; bMbti: string;
      score: number;
    };

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

  const chem = summarizeChemTypes(pairs.map(p => ({ aMbti: p.aMbti, bMbti: p.bMbti, score: p.score })));

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

        {/* existing: ranking */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">🏆 케미 랭킹</div>
              <div className="text-[11px] text-slate-500">모임 전체 기준</div>
            </div>

            {best3.length === 0 ? (
              <p className="mt-2 text-sm text-slate-500">
                랭킹을 보려면 MBTI를 입력한 멤버가 2명 이상 필요해요.
              </p>
            ) : (
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
                          <span className="truncate">
                            {p.aName} × {p.bName}
                          </span>
                        </div>

                        <span className="shrink-0 rounded-full bg-[#1E88E5]/10 px-2 py-0.5 text-[11px] font-extrabold text-[#1E88E5]">
                          {p.score}
                        </span>
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
                          <span className="truncate">
                            {p.aName} × {p.bName}
                          </span>
                        </div>

                        <span className="shrink-0 rounded-full bg-rose-500/10 px-2 py-0.5 text-[11px] font-extrabold text-rose-600">
                          {p.score}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
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


        {/* ✅ 1) MBTI 분포 */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">📌 모임 MBTI 분포</div>
              <div className="text-[11px] text-slate-500">입력된 MBTI 기준</div>
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
              <div className="text-[11px] text-slate-500">MBTI 기반</div>
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
                                const isTop = !!pick1 && pick1.name === m.name && pick1.mbti === m.mbti;
                                const styled = roleTitleStyled(k, m.fit);

                                return (
                                  <li
                                    key={`${k}-${m.name}-${m.mbti}`}
                                    className={[
                                      "relative flex items-center justify-between px-3 py-2",
                                      isTop ? "bg-white/85" : "",
                                    ].join(" ")}
                                    title={`적합도 ${m.fit}`}
                                  >
                                    {/* 대표 강조: 스티커 대신 아주 얇은 라인 */}
                                    {isTop && <div className={`absolute left-0 top-0 h-full w-1 ${th.leftBar}`} />}

                                    <div className="min-w-0 flex items-center gap-2">
                                      <span className="w-4 shrink-0 text-[11px] font-extrabold text-slate-400">
                                        {idx + 1}
                                      </span>

                                      <span
                                        className={[
                                          "truncate text-xs font-extrabold",
                                          isTop ? "text-slate-900" : "text-slate-800",
                                        ].join(" ")}
                                      >
                                        {m.name}
                                      </span>

                                      <span className="text-slate-300">·</span>

                                      <span
                                        className={[
                                          "shrink-0 text-xs font-extrabold",
                                          isTop ? "text-slate-700" : "text-slate-600",
                                        ].join(" ")}
                                      >
                                        {m.mbti}
                                      </span>
                                    </div>

                                    <div className="shrink-0 flex items-center gap-2">
                                      {/* 스티커/배지 없이 텍스트로만 */}
                                      <span className={`text-[11px] ${styled.cls}`}>
                                        {styled.crown && "👑 "}
                                        {styled.title}
                                      </span>
                                    </div>
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

                      </div>
                    );
                  })}
                </div>

              </>
            )}
          </div>
        </section>


        {/* ✅ 3) 케미 타입 분류 */}
        <section className="mt-6">
          <div className="rounded-3xl bg-white/70 p-4 ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <div className="text-sm font-extrabold">⚡ 케미 타입 분류</div>
              <div className="text-[11px] text-slate-500">모임 전체 기준</div>
            </div>

            <div className="mt-3 rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
              <div className="text-xs font-extrabold text-slate-800">{chem.headline}</div>
              <p className="mt-1 text-xs text-slate-600">{chem.tip}</p>
            </div>

            {pairs.length > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3">
                {(["STABLE", "COMPLEMENT", "SPARK", "EXPLODE"] as ChemType[]).map((t) => (
                  <div key={t} className="rounded-2xl bg-white/60 p-3 ring-1 ring-black/5">
                    <div className="text-xs font-extrabold text-slate-800">{chemLabel(t)}</div>
                    <div className="mt-1 text-[11px] text-slate-500">
                      {chem.dist[t]}쌍 · {pct(chem.dist[t])}%
                    </div>
                  </div>
                ))}
              </div>
            )}

            {pairs.length === 0 && (
              <p className="mt-2 text-sm text-slate-500">
                케미 타입을 보려면 MBTI 입력 멤버가 2명 이상 필요해요.
              </p>
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
