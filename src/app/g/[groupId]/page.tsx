import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import InviteActions from "@/components/InviteActions";
import RememberGroupClient from "@/components/RememberGroupClient";
import ChemMoreList from "@/app/g/[groupId]/components/ChemMoreList";
import RoleMoreList from "@/app/g/[groupId]/components/RoleMoreList";
import GraphServer from "./GraphServer";
import { calcCompatScore } from "@/lib/mbtiCompat";
import { unstable_cache } from "next/cache";
import ChemReportSection from "@/app/g/[groupId]/components/ChemReportSection";
import TouchSavedGroupClient from "@/components/TouchSavedGroupClient";
import SaveGroupClient from "@/components/SaveGroupClient";
import ChemTopWorst from "./components/ChemTopWorst";


import Link from "next/link";
import { Suspense } from "react";

const isValidMbti = (s?: string | null) => /^[EI][NS][TF][JP]$/i.test((s ?? "").trim());

type JudgeStyle = "LOGIC" | "PEOPLE";
type InfoStyle = "IDEA" | "FACT";
type PairRow = {
  aId: string; aName: string; aMbti: string;
  bId: string; bName: string; bMbti: string;
  score: number;

  // ✅ 추가 (인지기능 보정용)
  aJudge?: JudgeStyle; aInfo?: InfoStyle;
  bJudge?: JudgeStyle; bInfo?: InfoStyle;
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

function calcFitRanks(list: { fit: number }[]) {
  const sorted = [...list].sort((a, b) => b.fit - a.fit);

  const fitToRank = new Map<number, number>();
  let rank = 0;
  let lastFit: number | null = null;

  for (const m of sorted) {
    if (lastFit === null || m.fit < lastFit) {
      rank += 1;
      lastFit = m.fit;
    }
    if (!fitToRank.has(m.fit)) {
      fitToRank.set(m.fit, rank);
    }
  }

  return fitToRank; // fit -> rank (1부터 시작)
}


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

function roleDescMessage(role: RoleKey) {
  switch (role) {
    case "STRATEGY":
      return "큰그림·패턴을 먼저 보는 편이에요. 방향 잡고 설계하는 역할에 강해요.";
    case "VIBE":
      return "분위기 읽고 말 잘 이어주는 편이에요. 어색함을 풀어주는 역할이에요.";
    case "EXEC":
      return "생각보다 ‘일단 해보자’가 빠른 편이에요. 움직이게 만드는 추진력이에요.";
    case "ORGANIZE":
      return "정리·우선순위·결론을 잘 내는 편이에요. 회의 마무리 담당이에요.";
    case "MEDIATOR":
      return "서로 입장 차이를 부드럽게 맞추는 편이에요. 갈등을 줄여주는 역할이에요.";
  }
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
  members: { nickname: string; mbti: string; judgeStyle?: JudgeStyle; infoStyle?: InfoStyle }[]
) {
  // 아주 가벼운 휴리스틱(인지기능까지 안가도 충분히 납득감)
  const valid = members
  .map((m) => ({
    name: m.nickname,
    mbti: m.mbti.trim().toUpperCase(),
    judgeStyle: (m.judgeStyle ?? "LOGIC") as JudgeStyle,
    infoStyle: (m.infoStyle ?? "IDEA") as InfoStyle,
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

  const roleFitScore = (
    mbti: string,
    role: RoleKey,
    judgeStyle?: JudgeStyle,
    infoStyle?: InfoStyle
  ) => {
    const t = mbti.trim().toUpperCase();
    const E = t[0] === "E";
    const N = t[1] === "N";
    const T = t[2] === "T";
    const J = t[3] === "J";
    const S = t[1] === "S";
    const F = t[2] === "F";
    const P = t[3] === "P";

    let s = 50;

    /* =========================
      1️⃣ 역할별 기본 점수 (기존)
      ========================= */

    if (role === "STRATEGY") {
      if (N) s += 18;
      if (T) s += 18;
      if (!E) s += 6;
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
      if (!J) s += 6;
    }

    if (role === "ORGANIZE") {
      if (J) s += 18;
      if (T) s += 14;
      if (!E) s += 4;
      if (!N) s += 4;
    }

    if (role === "MEDIATOR") {
      if (F) s += 18;
      if (J) s += 12;
      if (E) s += 6;
    }

    /* =========================
      2️⃣ 인지 스타일 미세 가중치
      ========================= */

    const judge = judgeStyle ?? "LOGIC";
    const info = infoStyle ?? "IDEA";

    // 🧠 STRATEGY — 사고 결 + 추상 결 차이
    if (role === "STRATEGY") {
      if (T) s += 2;              // 논리적 설계
      if (F) s -= 1;              // 공감 설계(살짝 약함)
      if (info === "IDEA") s += 2;
      if (info === "FACT") s -= 1;
    }

    // 💬 VIBE — 감정 표현 방식 차이
    if (role === "VIBE") {
      if (F) s += 2;              // 공감형 분위기
      if (T) s -= 1;              // 논리형 분위기
      if (judge === "PEOPLE") s += 2;
      if (judge === "LOGIC") s -= 1;
    }

    // 🚀 EXEC — 실행 스타일 차이
    if (role === "EXEC") {
      if (S) s += 1;              // 현장형 실행
      if (N) s -= 1;              // 아이디어 과잉
      if (P) s += 2;              // 즉흥 추진
      if (J) s -= 1;              // 계획 과잉
      if (info === "FACT") s += 2;
    }

    // 🗂 ORGANIZE — 정리 방식 차이
    if (role === "ORGANIZE") {
      if (J) s += 2;              // 마감/결정 강함
      if (P) s -= 1;              // 유연하지만 늘어짐
      if (T) s += 1;              // 기준 명확
      if (F) s -= 1;
      if (info === "FACT") s += 2;
    }

    // 🧯 MEDIATOR — 중재 스타일 차이
    if (role === "MEDIATOR") {
      if (F) s += 2;              // 감정 중재
      if (T) s -= 1;              // 논리 중재(차갑게 보일 수 있음)
      if (judge === "PEOPLE") s += 2;
      if (info === "IDEA") s += 1;
    }

    /* =========================
      3️⃣ 🔍 초미세 타이브레이커
    ========================= */

    if (role === "STRATEGY") {
      if (N) s += 1;
      if (T) s += 1;
      if (!E) s += 1;
      if (S) s -= 1;
    }

    if (role === "VIBE") {
      if (E) s += 1;
      if (F) s += 1;
      if (!J) s += 1;
      if (T) s -= 1;
    }

    if (role === "EXEC") {
      if (S) s += 1;
      if (P) s += 1;
      if (T) s += 1;
      if (N) s -= 1;
    }

    if (role === "ORGANIZE") {
      if (J) s += 1;
      if (T) s += 1;
      if (!E) s += 1;
      if (P) s -= 1;
    }

    if (role === "MEDIATOR") {
      if (F) s += 1;
      if (J) s += 1;
      if (E) s += 1;
      if (T) s -= 1;
    }


    return Math.max(0, Math.min(100, Math.round(s)));
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
        fit: roleFitScore(m.mbti, r, m.judgeStyle, m.infoStyle),
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
        judgeStyle: (m.judgeStyle ?? "LOGIC") as JudgeStyle, // ✅
        infoStyle: (m.infoStyle ?? "IDEA") as InfoStyle,     // ✅
      }));

    const pairs: PairRow[] = [];
    for (let i = 0; i < membersForRank.length; i++) {
      for (let j = i + 1; j < membersForRank.length; j++) {
        const a = membersForRank[i];
        const b = membersForRank[j];

        const base = calcCompatScore(a.mbti, b.mbti);
        const score = adjustChemScoreByStyles(
          base,
          { judge: a.judgeStyle, info: a.infoStyle },
          { judge: b.judgeStyle, info: b.infoStyle }
        );

        pairs.push({
          aId: a.id,
          aName: a.nickname,
          aMbti: a.mbti,
          bId: b.id,
          bName: b.nickname,
          bMbti: b.mbti,
          score: score,
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

function clampScore(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function adjustChemScoreByStyles(
  base: number,
  a: { judge?: JudgeStyle; info?: InfoStyle },
  b: { judge?: JudgeStyle; info?: InfoStyle }
) {
  let s = base;

  const aj = a.judge ?? "LOGIC";
  const bj = b.judge ?? "LOGIC";
  const ai = a.info ?? "IDEA";
  const bi = b.info ?? "IDEA";

  // -----------------------------
  // 1️⃣ 판단 기준 (논리 vs 사람)
  // -----------------------------
  if (aj === bj) {
    s += 4; // ✅ 같은 기준 → 말이 빨리 맞음
  } else {
    s -= 5; // ❗ 핵심 충돌: 결론 내는 방식 자체가 다름
  }

  // -----------------------------
  // 2️⃣ 정보 처리 (아이디어 vs 사실)
  // -----------------------------
  if (ai === bi) {
    s += 3; // 같은 레벨에서 이야기
  } else {
    s -= 3; // 전제부터 어긋남
  }

  // -----------------------------
  // 3️⃣ 궁합이 낮은데 스타일까지 다르면 증폭
  // -----------------------------
  if (base < 55 && aj !== bj) {
    s -= 3; // ❗ 싸움으로 번질 확률
  }

  if (base < 55 && ai !== bi) {
    s -= 2; // 은근한 피로 누적
  }

  // -----------------------------
  // 4️⃣ 궁합이 높은데 스타일이 맞으면 보너스
  // -----------------------------
  if (base >= 70 && aj === bj && ai === bi) {
    s += 2; // 말 안 해도 통하는 느낌
  }

  return clampScore(s);
}

function SectionCard2({
  icon,
  title,
  subtitle,
  tone = "blue",
  children,
}: {
  icon: string;
  title: string;
  subtitle?: string;
  tone?: "blue" | "indigo" | "violet" | "emerald";
  children: React.ReactNode;
}) {
  const toneMap = {
    blue: {
      top: "bg-[#1E88E5]",
      chip: "bg-[#1E88E5]/10 text-[#1E88E5]",
      headerBg: "bg-[#1E88E5]/[0.06]",
    },
    indigo: {
      top: "bg-indigo-500",
      chip: "bg-indigo-500/10 text-indigo-700",
      headerBg: "bg-indigo-500/[0.06]",
    },
    violet: {
      top: "bg-violet-500",
      chip: "bg-violet-500/10 text-violet-700",
      headerBg: "bg-violet-500/[0.06]",
    },
    emerald: {
      top: "bg-emerald-500",
      chip: "bg-emerald-500/10 text-emerald-700",
      headerBg: "bg-emerald-500/[0.06]",
    },
  }[tone];

  return (
    <section className="mt-6">
      <div className="overflow-hidden rounded-3xl bg-white/75 shadow-sm ring-1 ring-black/5">
        {/* ✅ 상단 얇은 라인(구분감 핵심) */}


        {/* ✅ 헤더 스트립(아주 약한 배경톤) */}
        <div className={`px-4 py-3 ${toneMap.headerBg}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${toneMap.chip}`}>
                  {icon} {title}
                </span>
                {subtitle ? (
                  <span className="text-[11px] font-bold text-slate-500">
                    {subtitle}
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* ✅ 본문 */}
        <div className="px-4 pb-4">{children}</div>
      </div>
    </section>
  );
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
        judgeStyle: (m.judgeStyle ?? "LOGIC") as JudgeStyle,
        infoStyle: (m.infoStyle ?? "IDEA") as InfoStyle,
      }))
  );

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
    <main className="min-h-screen bg-[#F5F9FF] text-slate-900 pb-10">
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

        <TouchSavedGroupClient groupId={groupId} groupName={group.name} />

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

            <div className="mt-5">
              <div id="group-actions-slot" />
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

        {/* ✅ 최고 / 최악 */}
        <SectionCard2
          icon="🏆"
          title="케미 순위"
          subtitle="상·하위 조합"
          tone="blue"
        >
          <ChemTopWorst best3={best3} worst3={worst3} />
        </SectionCard2>

        {/* ✅ 케미 리포트 (랭킹 + 타입요약) */}
        <SectionCard2
          icon="🔍"
          title="케미 리포트"
          subtitle="분위기 요약 & 타입별 랭킹"
          tone="violet"
        >
          <ChemReportSection pairs={pairs} />
        </SectionCard2>


        {/* ✅ 1) MBTI 분포 */}
        <SectionCard2
          icon="📌"
          title="MBTI 분포"
          subtitle="우리 모임 성향 비율"
          tone="indigo"
        >
          {validMbtis.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">
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
        </SectionCard2>

        {/* ✅ 2) 역할 추천 */}
        <SectionCard2
          icon="🎭"
          title="모임 역할 추천"
          subtitle="누가 어떤 역할에 강한지"
          tone="emerald"
        >
          {validMbtis.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">
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

                    const fitRankMap = calcFitRanks(sorted);

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
                              {roleDescMessage(k)}
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
                                const rank = fitRankMap.get(m.fit) ?? 999; // 1,2,3...
                                const badge = roleRankBadge(k, rank - 1); // roleRankBadge는 0=1등 규칙
                                const isCoFirst = rank === 1;

                                return (
                                  <li
                                    key={`${k}-${m.name}-${m.mbti}`}
                                    className={[
                                      "relative flex items-center justify-between px-3 py-2",
                                      isCoFirst ? "bg-white/85" : ""
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
                                    <span className="shrink-0 text-right text-[11px] leading-tight">
                                      <div>
                                        {isCoFirst && "👑 "}
                                        {badge && <span className={badge.cls}>{badge.title}</span>}
                                      </div>
                                      <div className="font-extrabold text-slate-700">
                                        {m.fit}점
                                      </div>
                                    </span>

                                  </li>
                                );
                              })}

                            </ul>

                            <RoleMoreList roleKey={k} members={sorted} shown={5} />
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
        </SectionCard2>

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
