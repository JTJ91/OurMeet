import type { Metadata } from "next";
import { prisma } from "@/lib/mbti/prisma";
import { notFound } from "next/navigation";
import InviteActionsIntl from "@/features/mbti/components/InviteActions";
import RememberGroupClientIntl from "@/components/RememberGroupClient";
import ChemMoreListIntl from "@/features/mbti/g/[groupId]/components/ChemMoreListIntl";
import RoleMoreListIntl from "@/features/mbti/g/[groupId]/components/RoleMoreListIntl";
import GraphServerIntl from "@/features/mbti/g/[groupId]/GraphServerIntl";
import { getCompatScore } from "@/lib/mbti/mbtiCompat";
import { unstable_cache } from "next/cache";
import ChemReportSectionIntl from "@/features/mbti/g/[groupId]/components/ChemReportSectionIntl";
import TouchSavedGroupClientIntl from "@/components/TouchSavedGroupClient";
import SaveGroupClientIntl from "@/components/SaveGroupClient";
import ChemTopWorstIntl from "@/features/mbti/g/[groupId]/components/ChemTopWorstIntl";
import { normalizeMemberPrefs, type MemberPrefs } from "@/lib/mbti/memberPrefs";


import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { alternatesForPath } from "@/i18n/metadata";

type TranslateFn = (key: string, values?: Record<string, any>) => string;

function isMeaningfulTranslation(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/[\p{L}\p{N}]/u.test(trimmed)) return true;
  return /\{[^}]+\}/.test(trimmed);
}

function tx(t: TranslateFn | undefined, key: string, fallback: string, values?: Record<string, unknown>) {
  if (!t) return fallback;
  try {
    const translated = t(key, values);
    return isMeaningfulTranslation(translated) ? translated : fallback;
  } catch {
    return fallback;
  }
}

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
  aPrefs?: MemberPrefs;
  bPrefs?: MemberPrefs;
};

type AxisKey = "EI" | "NS" | "TF" | "JP" | "BAL";

type TextToken =
  | { t: string }            // 일반 텍스트
  | { t: string; k: AxisKey }; // ✅ 강조 토큰(색/굵게)

const T = (t: string): TextToken => ({ t });
const H = (t: string, k: AxisKey): TextToken => ({ t, k });

type VibeBlock = {
  core: { label: string; k: AxisKey }[];      // 요약 칩
  scene: TextToken[][];                        // 문장(토큰 배열) 여러 줄
  caution: { k: AxisKey; tokens: TextToken[] };// 주의 포인트
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

    const aPct = pct(A);
    const bPct = pct(B);
    const diffPct = Math.abs(aPct - bPct); // ✅ 격차 (0~100)

    return {
      a: { key: a, label: labelA, v: A, pct: aPct },
      b: { key: b, label: labelB, v: B, pct: bPct },
      dom,
      diffPct, // ✅ 추가
    };
  };


  const ei = axisLine("E", "I", "E(외향)", "I(내향)");
  const ns = axisLine("N", "S", "N(직관)", "S(감각)");
  const tf = axisLine("T", "F", "T(사고)", "F(감정)");
  const jp = axisLine("J", "P", "J(판단)", "P(인식)");


  type VibeBlock = {
    core: { label: string; k: Exclude<AxisKey, "TF"> | "BAL" }[]; // EI/NS/JP/BAL만
    scene: TextToken[][];
    caution: { k: AxisKey; tokens: TextToken[] };
  };

  
  // 한줄 총평(가벼운 위트, 밈X)
  const vibe: VibeBlock = (() => {
    const domEI = ei.dom; // "E" | "I" | null
    const domNS = ns.dom; // "N" | "S" | null
    const domTF = tf.dom; // "T" | "F" | null
    const domJP = jp.dom; // "J" | "P" | null

    const isTie = (x: { dom: any; diffPct: number }) => x.dom === null || x.diffPct <= 10;

    // ✅ 1) 핵심 3칩
    const core = [
      isTie(ei)
        ? { label: "상황형", k: "BAL" as const }
        : { label: domEI === "E" ? "토크형" : "조용한 핵심형", k: "EI" as const },

      isTie(ns)
        ? { label: "균형 감각", k: "BAL" as const }
        : { label: domNS === "N" ? "아이디어 폭주" : "현실 결론", k: "NS" as const },

      isTie(jp)
        ? { label: "유연 운영", k: "BAL" as const }
        : { label: domJP === "J" ? "정리 담당 존재" : "즉흥 운영", k: "JP" as const },
    ];

    // ✅ 2) 장면 문장 (핵심 단어만 강조 토큰)
    const scene: TextToken[][] = [
      // EI
      isTie(ei)
        ? [T("말할 땐 말하고, 쉴 땐 쉬어요.")]
        : domEI === "E"
          ? [H("대화", "EI"), T("가 먼저 "), H("시동", "EI"), T("이고, "), H("침묵", "EI"), T("은 잠깐뿐이에요.")]
          : [H("조용", "EI"), T("하다가 한 번 말하면 "), H("핵심", "EI"), T("만 정확해요.")],

      // NS
      isTie(ns)
        ? [H("큰그림", "NS"), T("과 "), H("디테일", "NS"), T("이 번갈아 나와요.")]
        : domNS === "N"
          ? [H("주제", "NS"), T("가 옆길로 "), H("확장", "NS"), T("되는 게 정상입니다.")]
          : [T("얘기가 새도 결국 "), H("실행", "NS"), T(" 얘기로 돌아와요.")],

      // JP
      isTie(jp)
        ? [H("결론", "JP"), T("도 열어두고, 필요하면 닫아요.")]
        : domJP === "J"
          ? [H("정리", "JP"), T(" 담당이 자연스럽게 등장해서 회의를 닫아줍니다.")]
          : [H("결론", "JP"), T("은 나중, 일단 "), H("굴리면서", "JP"), T(" 맞춰요.")],
    ];

    // ✅ 3) 주의 포인트 (역시 핵심 단어만 강조)
    const caution = (() => {
      if (!isTie(tf)) {
        if (domTF === "T") {
          return {
            k: "TF" as const,
            tokens: [H("직설", "TF"), T("로 들릴 수 있어요. "), H("요약 멘트", "TF"), T("에 쿠션을 한 번만.")],
          };
        }
        if (domTF === "F") {
          return {
            k: "TF" as const,
            tokens: [H("결론", "TF"), T("이 늦어질 수 있어요. "), H("결정할 항목", "TF"), T("만 미리 박아두면 좋아요.")],
          };
        }
      }

      if (!isTie(jp) && domJP === "P") {
        return {
          k: "JP" as const,
          tokens: [H("일정", "JP"), T("이 자주 바뀔 수 있어요. "), H("마감", "JP"), T("만 하나 잡아두면 편해요.")],
        };
      }

      return {
        k: "BAL" as const,
        tokens: [T("큰 단점은 없고, "), H("주제", "BAL"), T("만 명확하면 더 잘 굴러가요.")],
      };
    })();

    return { core, scene, caution };
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


function roleLabel(r: RoleKey, t?: TranslateFn) {
  switch (r) {
    case "STRATEGY": return tx(t, "roles.labels.STRATEGY", "🧠 전략 담당");
    case "VIBE": return tx(t, "roles.labels.VIBE", "💬 분위기 담당");
    case "EXEC": return tx(t, "roles.labels.EXEC", "🚀 실행 엔진");
    case "ORGANIZE": return tx(t, "roles.labels.ORGANIZE", "🗂 정리/결정");
    case "MEDIATOR": return tx(t, "roles.labels.MEDIATOR", "🧯 중재/조율");
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

function roleRankBadge(role: RoleKey, rank: number, t?: TranslateFn) {
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
      [
        tx(t, "roles.badges.STRATEGY.1", "전략 설계자"),
        tx(t, "roles.badges.STRATEGY.2", "구조 장인"),
        tx(t, "roles.badges.STRATEGY.3", "아이디어 브레인"),
        tx(t, "roles.badges.STRATEGY.4", "전략 보조"),
      ],
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
      [
        tx(t, "roles.badges.ORGANIZE.1", "정리왕"),
        tx(t, "roles.badges.ORGANIZE.2", "결정 장인"),
        tx(t, "roles.badges.ORGANIZE.3", "체계 관리자"),
        tx(t, "roles.badges.ORGANIZE.4", "보조 정리러"),
      ],
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
      [
        tx(t, "roles.badges.VIBE.1", "분위기 메이커"),
        tx(t, "roles.badges.VIBE.2", "공감 리더"),
        tx(t, "roles.badges.VIBE.3", "대화 촉진자"),
        tx(t, "roles.badges.VIBE.4", "소통 보조"),
      ],
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
      [
        tx(t, "roles.badges.EXEC.1", "실행 엔진"),
        tx(t, "roles.badges.EXEC.2", "행동 대장"),
        tx(t, "roles.badges.EXEC.3", "추진 담당"),
        tx(t, "roles.badges.EXEC.4", "참여형"),
      ],
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
    [
      tx(t, "roles.badges.MEDIATOR.1", "평화 유지군"),
      tx(t, "roles.badges.MEDIATOR.2", "조율 장인"),
      tx(t, "roles.badges.MEDIATOR.3", "감정 균형자"),
      tx(t, "roles.badges.MEDIATOR.4", "중재 보조"),
    ],
    [
      "text-rose-700 font-extrabold",
      "text-rose-600 font-bold",
      "text-rose-500",
      "text-rose-400",
    ]
  );
}

function roleDescMessage(role: RoleKey, t?: TranslateFn) {
  switch (role) {
    case "STRATEGY":
      return tx(t, "roles.desc.STRATEGY", "큰그림·패턴을 먼저 보는 편이에요. 방향 잡고 설계하는 역할에 강해요.");
    case "VIBE":
      return tx(t, "roles.desc.VIBE", "분위기 읽고 말 잘 이어주는 편이에요. 어색함을 풀어주는 역할이에요.");
    case "EXEC":
      return tx(t, "roles.desc.EXEC", "생각보다 ‘일단 해보자’가 빠른 편이에요. 움직이게 만드는 추진력이에요.");
    case "ORGANIZE":
      return tx(t, "roles.desc.ORGANIZE", "정리·우선순위·결론을 잘 내는 편이에요. 회의 마무리 담당이에요.");
    case "MEDIATOR":
      return tx(t, "roles.desc.MEDIATOR", "서로 입장 차이를 부드럽게 맞추는 편이에요. 갈등을 줄여주는 역할이에요.");
  }
}


function roleEmptyMessage(role: RoleKey, t?: TranslateFn) {
  switch (role) {
    case "STRATEGY":
      return tx(t, "roles.empty.STRATEGY", "큰 방향을 잡는 사람이 없어서, 회의가 길어질 수 있어요.");
    case "VIBE":
      return tx(t, "roles.empty.VIBE", "분위기를 잡아주는 사람이 없어서, 말이 조금 딱딱해질 수 있어요.");
    case "EXEC":
      return tx(t, "roles.empty.EXEC", "실행으로 밀어붙일 사람이 없어서, 아이디어가 멈출 수 있어요.");
    case "ORGANIZE":
      return tx(t, "roles.empty.ORGANIZE", "정리/결정 담당이 없어서, 결론이 미뤄질 수 있어요.");
    case "MEDIATOR":
      return tx(t, "roles.empty.MEDIATOR", "중재해줄 사람이 없어서, 작은 오해가 오래 갈 수 있어요.");
  }
}


function pickRolesForGroup(
  members: { nickname: string; mbti: string; judgeStyle?: JudgeStyle; infoStyle?: InfoStyle }[],
  t?: TranslateFn
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
    if (!a) return tx(t, "roles.summary.headline.noMembers", "구성원이 더 모이면 역할이 더 또렷해져요.");
    if (a.v === 0) return tx(t, "roles.summary.headline.noDistribution", "아직 역할 분포가 얇아요. 더 많은 MBTI 입력이 필요해요.");
    return tx(
      t,
      "roles.summary.headline.default",
      `이 방은 ${roleLabel(a.k, t)} 성향이 강하고, ${b ? roleLabel(b.k, t) : tx(t, "balanceLabel", "균형")} 쪽도 같이 있어요.`,
      {
        mainRole: roleLabel(a.k, t),
        secondaryRole: b ? roleLabel(b.k, t) : tx(t, "balanceLabel", "균형"),
      }
    );
  })();

  const tip = (() => {
    const lack = lacking2[0];
    if (!lack || lack.v > 0) return tx(t, "roles.summary.tip.default", "역할은 고정이 아니에요. 상황에 따라 바뀌어도 자연스러워요.");
    // 부족 역할이 0명일 때만 살짝 자극
    return tx(
      t,
      "roles.summary.tip.lack",
      `조심 포인트: ${roleLabel(lack.k, t)}가 비어 있어요. 이 역할을 맡는 사람이 없으면 회의가 길어질 수 있어요.`,
      { role: roleLabel(lack.k, t) }
    );
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

//** ✅ cached rankings (groupId 별 캐시 분리 + best/worst 안정 계산) */
const getRankings = (groupId: string) =>
  unstable_cache(
    async () => {
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
          judgeStyle: (m.judgeStyle ?? "LOGIC") as JudgeStyle,
          infoStyle: (m.infoStyle ?? "IDEA") as InfoStyle,
          prefs: normalizeMemberPrefs({
            ideaStrength: m.ideaStrength,
            factStrength: m.factStrength,
            logicStrength: m.logicStrength,
            peopleStrength: m.peopleStrength,
            conflictStyle: m.conflictStyle,
            energy: m.energy,
          }),
        }));

      const pairs: PairRow[] = [];

      for (let i = 0; i < membersForRank.length; i++) {
        for (let j = i + 1; j < membersForRank.length; j++) {
          const a = membersForRank[i];
          const b = membersForRank[j];

          const score = getCompatScore(a.id, a.mbti, b.id, b.mbti).score;

          pairs.push({
            aId: a.id,
            aName: a.nickname,
            aMbti: a.mbti,
            bId: b.id,
            bName: b.nickname,
            bMbti: b.mbti,
            score,
            aPrefs: a.prefs,
            bPrefs: b.prefs,
          });
        }
      }

      // ✅ 안정 정렬(점수 동률일 때 aId/bId로 고정)
      const sortedDesc = [...pairs].sort((x, y) => {
        if (y.score !== x.score) return y.score - x.score;
        const ax = `${x.aId}:${x.bId}`;
        const ay = `${y.aId}:${y.bId}`;
        return ax.localeCompare(ay);
      });

      const sortedAsc = [...pairs].sort((x, y) => {
        if (x.score !== y.score) return x.score - y.score;
        const ax = `${x.aId}:${x.bId}`;
        const ay = `${y.aId}:${y.bId}`;
        return ax.localeCompare(ay);
      });

      const best3 = sortedDesc.slice(0, 3);
      const worst3 = sortedAsc.slice(0, 3);

      return { group, best3, worst3, pairs };
    },
    // ✅ groupId를 캐시 키에 포함 (그룹별 캐시 완전 분리)
    ["group-rankings", groupId],
    { revalidate: 60 }
  )();


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
      chip: "bg-[#1E88E5]/12 text-[#1E88E5]",
      headerBg: "bg-[#1E88E5]/[0.05]",
    },
    indigo: {
      top: "bg-indigo-500",
      chip: "bg-indigo-500/10 text-indigo-700",
      headerBg: "bg-indigo-500/[0.05]",
    },
    violet: {
      top: "bg-violet-500",
      chip: "bg-violet-500/10 text-violet-700",
      headerBg: "bg-violet-500/[0.05]",
    },
    emerald: {
      top: "bg-emerald-500",
      chip: "bg-emerald-500/10 text-emerald-700",
      headerBg: "bg-emerald-500/[0.05]",
    },
  }[tone];

  return (
    <section className="mt-6">
      <div className="mbti-card-frame overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        {/* ✅ 상단 얇은 라인(구분감 핵심) */}


        {/* ✅ 헤더 스트립(아주 약한 배경톤) */}
        <div className={`px-4 py-3 ${toneMap.headerBg} border-b border-slate-200/60`}>
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
        <div className="px-4 pb-4 pt-1">{children}</div>
      </div>
    </section>
  );
}



export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; groupId: string }>;
}): Promise<Metadata> {
  const { locale, groupId } = await params;
  return {
    alternates: alternatesForPath(`/mbti/g/${groupId}`, locale),
  };
}

export default async function GroupPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; groupId: string }>;
  searchParams?: Promise<{ center?: string }>;
}) {
  const { locale, groupId } = await params;
  const t = await getTranslations({ locale, namespace: "groupPage" });
  const tt = (key: string, fallback: string, values?: Record<string, unknown>) => tx(t, key, fallback, values);
  const sp = (await searchParams) ?? {};
  const centerId = sp.center;
  const base = locale === "ko" ? "" : `/${locale}`;

  const pctNum = (n: number, total: number) => (total ? Math.round((n / total) * 100) : 0);
  const fracText = (n: number, total: number) =>
    tt("countFormat", `${n}/${total}명 (${pctNum(n, total)}%)`, { value: n, total, percent: pctNum(n, total) });

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
  const fracText2 = (n: number) => tt("countFormat", `${n}/${distTotal}명 (${pctPeople(n)}%)`, { value: n, total: distTotal, percent: pctPeople(n) });

  const dist = summarizeMbtiDistribution(validMbtis);

  dist.ei.a.label = tt("distribution.axisLabels.eiE", "E(외향)");
  dist.ei.b.label = tt("distribution.axisLabels.eiI", "I(내향)");
  dist.ns.a.label = tt("distribution.axisLabels.nsN", "N(직관)");
  dist.ns.b.label = tt("distribution.axisLabels.nsS", "S(감각)");
  dist.tf.a.label = tt("distribution.axisLabels.tfT", "T(사고)");
  dist.tf.b.label = tt("distribution.axisLabels.tfF", "F(감정)");
  dist.jp.a.label = tt("distribution.axisLabels.jpJ", "J(판단)");
  dist.jp.b.label = tt("distribution.axisLabels.jpP", "P(인식)");

  const vibeTokenMap: Record<string, string> = {
    "상황형": tt("distribution.vibe.core.situational", "상황형"),
    "토크형": tt("distribution.vibe.core.talkative", "토크형"),
    "조용한 핵심형": tt("distribution.vibe.core.quietCore", "조용한 핵심형"),
    "균형 감각": tt("distribution.vibe.core.balanceSense", "균형 감각"),
    "아이디어 폭주": tt("distribution.vibe.core.ideaRush", "아이디어 폭주"),
    "현실 결론": tt("distribution.vibe.core.practicalConclusion", "현실 결론"),
    "유연 운영": tt("distribution.vibe.core.flexibleOps", "유연 운영"),
    "정리 담당 존재": tt("distribution.vibe.core.organizerPresent", "정리 담당 존재"),
    "즉흥 운영": tt("distribution.vibe.core.impromptuOps", "즉흥 운영"),
    "말할 땐 말하고, 쉴 땐 쉬어요.": tt("distribution.vibe.scene.ei.tie", "말할 땐 말하고, 쉴 땐 쉬어요."),
    "대화": tt("distribution.vibe.scene.ei.talk", "대화"),
    "가 먼저 ": tt("distribution.vibe.scene.ei.talkFirst", "가 먼저 "),
    "시동": tt("distribution.vibe.scene.ei.ignite", "시동"),
    "이고, ": tt("distribution.vibe.scene.ei.and", "이고, "),
    "침묵": tt("distribution.vibe.scene.ei.silence", "침묵"),
    "은 잠깐뿐이에요.": tt("distribution.vibe.scene.ei.shortOnly", "은 잠깐뿐이에요."),
    "조용": tt("distribution.vibe.scene.ei.quiet", "조용"),
    "하다가 한 번 말하면 ": tt("distribution.vibe.scene.ei.quietThen", "하다가 한 번 말하면 "),
    "핵심": tt("distribution.vibe.scene.ei.core", "핵심"),
    "만 정확해요.": tt("distribution.vibe.scene.ei.preciseOnly", "만 정확해요."),
    "큰그림": tt("distribution.vibe.scene.ns.bigPicture", "큰그림"),
    "과 ": tt("distribution.vibe.scene.ns.with", "과 "),
    "디테일": tt("distribution.vibe.scene.ns.detail", "디테일"),
    "이 번갈아 나와요.": tt("distribution.vibe.scene.ns.alternate", "이 번갈아 나와요."),
    "주제": tt("distribution.vibe.scene.ns.topic", "주제"),
    "가 옆길로 ": tt("distribution.vibe.scene.ns.sidePath", "가 옆길로 "),
    "확장": tt("distribution.vibe.scene.ns.expand", "확장"),
    "되는 게 정상입니다.": tt("distribution.vibe.scene.ns.normal", "되는 게 정상입니다."),
    "얘기가 새도 결국 ": tt("distribution.vibe.scene.ns.offTopic", "얘기가 새도 결국 "),
    "실행": tt("distribution.vibe.scene.ns.execution", "실행"),
    " 얘기로 돌아와요.": tt("distribution.vibe.scene.ns.backToExec", " 얘기로 돌아와요."),
    "결론": tt("distribution.vibe.scene.jp.conclusion", "결론"),
    "도 열어두고, 필요하면 닫아요.": tt("distribution.vibe.scene.jp.openClose", "도 열어두고, 필요하면 닫아요."),
    "정리": tt("distribution.vibe.scene.jp.organize", "정리"),
    " 담당이 자연스럽게 등장해서 회의를 닫아줍니다.": tt("distribution.vibe.scene.jp.organizerAppears", " 담당이 자연스럽게 등장해서 회의를 닫아줍니다."),
    "은 나중, 일단 ": tt("distribution.vibe.scene.jp.laterFirst", "은 나중, 일단 "),
    "굴리면서": tt("distribution.vibe.scene.jp.roll", "굴리면서"),
    " 맞춰요.": tt("distribution.vibe.scene.jp.adjust", " 맞춰요."),
    "직설": tt("distribution.vibe.caution.direct", "직설"),
    "로 들릴 수 있어요. ": tt("distribution.vibe.caution.directTail", "로 들릴 수 있어요. "),
    "요약 멘트": tt("distribution.vibe.caution.summary", "요약 멘트"),
    "에 쿠션을 한 번만.": tt("distribution.vibe.caution.summaryTail", "에 쿠션을 한 번만."),
    "이 늦어질 수 있어요. ": tt("distribution.vibe.caution.conclusionTail", "이 늦어질 수 있어요. "),
    "결정할 항목": tt("distribution.vibe.caution.decideItem", "결정할 항목"),
    "만 미리 박아두면 좋아요.": tt("distribution.vibe.caution.decideTail", "만 미리 박아두면 좋아요."),
    "일정": tt("distribution.vibe.caution.schedule", "일정"),
    "이 자주 바뀔 수 있어요. ": tt("distribution.vibe.caution.scheduleTail", "이 자주 바뀔 수 있어요. "),
    "마감": tt("distribution.vibe.caution.deadline", "마감"),
    "만 하나 잡아두면 편해요.": tt("distribution.vibe.caution.deadlineTail", "만 하나 잡아두면 편해요."),
    "큰 단점은 없고, ": tt("distribution.vibe.caution.noBigDownside", "큰 단점은 없고, "),
    "만 명확하면 더 잘 굴러가요.": tt("distribution.vibe.caution.clearTopic", "만 명확하면 더 잘 굴러가요."),
  };
  const mapVibeText = (value: string) => vibeTokenMap[value] ?? value;
  dist.vibe.core = dist.vibe.core.map((c) => ({ ...c, label: mapVibeText(c.label) }));
  dist.vibe.scene = dist.vibe.scene.map((line) => line.map((token) => ({ ...token, t: mapVibeText(token.t) })));
  dist.vibe.caution.tokens = dist.vibe.caution.tokens.map((token) => ({ ...token, t: mapVibeText(token.t) }));

  const roles = pickRolesForGroup(
    group.members
      .filter((m) => isValidMbti(m.mbti))
      .map((m) => ({
        nickname: m.nickname,
        mbti: m.mbti ?? "",
        judgeStyle: (m.judgeStyle ?? "LOGIC") as JudgeStyle,
        infoStyle: (m.infoStyle ?? "IDEA") as InfoStyle,
      }))
    ,
    t
  );

  type AxisKey2 = "EI" | "NS" | "TF" | "JP";
  const AXIS_ONE: Record<AxisKey2, Record<string, string>> = {
    EI: {
      E: tt("distribution.axisOne.ei.E", "말이 자연스럽게 이어지고, 대화가 금방 살아나요."),
      I: tt("distribution.axisOne.ei.I", "조용한 편이지만, 나올 때는 핵심만 딱 집어요."),
    },
    NS: {
      N: tt("distribution.axisOne.ns.N", "이야기가 한 주제에서 또 다른 아이디어로 잘 이어져요."),
      S: tt("distribution.axisOne.ns.S", "얘기가 좀 새도, 결국 실행 얘기로 돌아오는 편이에요."),
    },
    TF: {
      T: tt("distribution.axisOne.tf.T", "먼저 정리하고 생각한 뒤에, 감정을 살펴보는 흐름이에요."),
      F: tt("distribution.axisOne.tf.F", "결론보다 먼저, 서로 어떤 느낌인지부터 나눠요."),
    },
    JP: {
      J: tt("distribution.axisOne.jp.J", "누군가 자연스럽게 정리하면서 흐름을 마무리해줘요."),
      P: tt("distribution.axisOne.jp.P", "결론은 열어두고, 해보면서 맞춰가는 분위기에요."),
    },
  };


  const BALANCE_ONE = tt("distribution.balanceOne", "어느 한쪽도 안 밀려서, 상황에 따라 톤이 자연스럽게 바뀝니다.");


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
  

  const AXIS_COLOR: Record<AxisKey | "BAL", string> = {
    EI: MBTI_COLOR[dist.ei.dom ?? "E"], // tie면 E색 대충
    NS: MBTI_COLOR[dist.ns.dom ?? "N"],
    TF: MBTI_COLOR[dist.tf.dom ?? "T"],
    JP: MBTI_COLOR[dist.jp.dom ?? "J"],
    BAL: "#64748B", // slate-500 느낌
  };
  function H({ k, children }: { k: AxisKey | "BAL"; children: React.ReactNode }) {
    return (
      <span className="font-extrabold" style={{ color: AXIS_COLOR[k] }}>
        {children}
      </span>
    );
  }


const axisToChar: Record<Exclude<AxisKey, "BAL">, "E"|"I"|"N"|"S"|"T"|"F"|"J"|"P"> = {
  EI: (dist.ei.dom ?? "E") as any,
  NS: (dist.ns.dom ?? "N") as any,
  TF: (dist.tf.dom ?? "T") as any,
  JP: (dist.jp.dom ?? "J") as any,
};

const axisColor = (k: AxisKey) => {
  if (k === "BAL") return "#64748B"; // slate-500
  return MBTI_COLOR[axisToChar[k]];
};

function renderTokens(tokens: { t: string; k?: AxisKey }[]) {
  return tokens.map((x, i) =>
    x.k ? (
      <span key={i} className="font-extrabold" style={{ color: axisColor(x.k) }}>
        {x.t}
      </span>
    ) : (
      <span key={i}>{x.t}</span>
    )
  );
}


  return (
    <main className="mbti-page-bg pb-12">
    
      <div className="mbti-shell">
        {/* Top left back */}
        <div className="mbti-card-frame flex items-center justify-between">
          <Link
            href={`${base}/mbti`}
            className="mbti-back-btn"
          >
            <span aria-hidden>←</span>
            <span>{tt("back", "뒤로가기")}</span>
          </Link>
        </div>

        <TouchSavedGroupClientIntl groupId={groupId} groupName={group.name} />

        {/* Unified top card */}
        <section className="mt-4">
          <div className="mbti-card-frame rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_12px_30px_rgba(15,23,42,0.08)] backdrop-blur-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-500">{tt("groupLabel", "모임")}</div>
                <h1 className="mt-1 truncate text-2xl font-extrabold tracking-tight">
                  {group.name}
                </h1>
                <p className="mt-2 text-sm text-slate-600">{tt("membersStatus", `현재 ${count}명 참여 중 · 최대 ${max}명`, { current: count, max })}</p>
              </div>

              <div className="relative">
                <InviteActionsIntl groupId={group.id} />
              </div>
            </div>

            {/* progress */}
            <div className="mt-4">
              <div className="h-2 w-full rounded-full bg-slate-200/80">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#1E88E5] to-[#3ba6ff]"
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
              <div className="mbti-card-frame rounded-3xl border border-slate-200/70 bg-white/85 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
                <div className="flex items-center justify-between">
                      <div className="text-sm font-extrabold">{tt("graphLoadingTitle", "🧭 관계도 로딩 중")}</div>
                  <div className="text-[11px] text-slate-500">{tt("graphLoadingWait", "잠시만요")}</div>
                </div>

                <div className="mt-3 h-[360px] w-full rounded-2xl border border-slate-200/70 bg-white/88 animate-pulse" />
                <p className="mt-2 text-xs text-slate-500">
                  {tt("graphLoadingDesc", "그래프 먼저 준비하고 있어요. 위 콘텐츠는 이미 볼 수 있어요.")}
                </p>
              </div>
            </section>
          }
        >
          <GraphServerIntl locale={locale} groupId={groupId} centerId={centerId} />
        </Suspense>

        {/* ✅ 최고 / 최악 */}
        <SectionCard2
          icon="🏆"
          title={tt("chemRankTitle", "케미 순위")}
          subtitle={tt("chemRankSubtitle", "상·하위 조합")}
          tone="blue"
        >
          <ChemTopWorstIntl best3={best3} worst3={worst3} />
        </SectionCard2>

        {/* ✅ 1) MBTI 분포 */}
        <SectionCard2
          icon="📌"
          title={tt("distributionTitle", "MBTI 분포")}
          subtitle={tt("distributionSubtitle", "우리 모임 성향 비율")}
          tone="indigo"
        >
          {validMbtis.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">
              {tt("distributionEmpty", "아직 입력된 MBTI가 없어요. 한 명만 입력해도 분포가 잡히기 시작해요.")}
            </p>
          ) : (
            <>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {[
                    { title: tt("distribution.axisTitles.energy", "에너지"), a: dist.ei.a, b: dist.ei.b },
                    { title: tt("distribution.axisTitles.info", "정보"), a: dist.ns.a, b: dist.ns.b },
                    { title: tt("distribution.axisTitles.judgement", "판단"), a: dist.tf.a, b: dist.tf.b },
                    { title: tt("distribution.axisTitles.style", "스타일"), a: dist.jp.a, b: dist.jp.b },
                  ].map((row) => {
                    const total = row.a.v + row.b.v || 1;

                    // ✅ 더 많은 쪽을 위(first)로
                    const first = row.a.v >= row.b.v ? row.a : row.b;
                    const second = row.a.v >= row.b.v ? row.b : row.a;

                    const firstPct = Math.round((first.v / total) * 100);
                    const secondPct = 100 - firstPct;

                    // ✅ gap을 먼저 선언!
                    const gap = Math.abs(firstPct - secondPct);

                    const axisKey =
                      row.title === tt("distribution.axisTitles.energy", "에너지") ? ("EI" as const) :
                      row.title === tt("distribution.axisTitles.info", "정보") ? ("NS" as const) :
                      row.title === tt("distribution.axisTitles.judgement", "판단") ? ("TF" as const) :
                      ("JP" as const);

                    const isTie = first.v === second.v;

                    // ✅ 이제 gap 사용
                    const tone =
                      isTie ? "tie" :
                      gap >= 40 ? "hard" :
                      gap >= 20 ? "mid" : "soft";

                    const oneLine =
                      isTie ? BALANCE_ONE : (AXIS_ONE[axisKey][first.key] ?? "");

                    const finalLine = tone === "soft" ? tt("distribution.mostlyPrefix", `대체로 ${oneLine}`, { line: oneLine }) : oneLine;


                    return (
                      <div key={row.title} className="rounded-2xl border border-slate-200/70 bg-white/88 p-3">
                        <div className="text-[11px] font-extrabold text-slate-500">{row.title}</div>

                        {/* ✅ first (다수파) */}
                        <div className="mt-2">
                          <div className="text-xs font-extrabold leading-tight break-words" style={{ color: MBTI_COLOR[first.key] }}>
                            {first.label}
                          </div>
                          <div className="mt-1 text-right text-[11px] font-semibold leading-tight tabular-nums" style={{ color: MBTI_COLOR[first.key] }}>
                            {fracText2(first.v)}
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ width: `${firstPct}%`, backgroundColor: MBTI_COLOR[first.key] }}
                          />
                        </div>

                        {/* ✅ second (소수파) */}
                        <div className="mt-2">
                          <div className="text-xs font-extrabold leading-tight break-words" style={{ color: MBTI_COLOR[second.key] }}>
                            {second.label}
                          </div>
                          <div className="mt-1 text-right text-[11px] font-semibold leading-tight tabular-nums" style={{ color: MBTI_COLOR[second.key] }}>
                            {fracText2(second.v)}
                          </div>
                        </div>
                        <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
                          <div
                            className="h-2 rounded-full transition-all duration-300"
                            style={{ width: `${secondPct}%`, backgroundColor: MBTI_COLOR[second.key] }}
                          />
                        </div>
                                           
                        
                        <div className="mt-3 text-[11px] leading-relaxed text-slate-500">
                          {finalLine}
                        </div>

                      </div>
                    );
                  })}
                </div>

                
                <div className="mt-3 rounded-2xl border border-slate-200/70 bg-white/88 p-3">
                  <div className="text-xs font-extrabold text-slate-800">{tt("distribution.vibeSummaryTitle", "모임 분위기 요약")}</div>

                  {/* ✅ 핵심 3칩 */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {dist.vibe.core.map((c, i) => (
                      <span
                        key={i}
                        className="rounded-full border border-slate-200/70 bg-white/88 px-2 py-1 text-[11px] font-extrabold"
                        style={{ color: axisColor(c.k) }}
                      >
                        {c.label}
                      </span>
                    ))}
                  </div>

                  {/* ✅ 장면 문장들: 핵심 단어만 색/굵게 */}
                  <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                    {dist.vibe.scene.map((line, i) => (
                      <div key={i}>• {renderTokens(line as any)}</div>
                    ))}
                  </div>

                  {/* ✅ 주의 포인트 */}
                  <div className="mt-2 rounded-xl border border-slate-200/70 bg-white/88 p-2">
                    <div className="text-[11px] font-extrabold text-slate-700">
                      <span className="font-extrabold" style={{ color: axisColor(dist.vibe.caution.k) }}>
                        {tt("distribution.cautionPoint", "주의 포인트")}
                      </span>
                    </div>
                    <div className="mt-0.5 text-xs leading-relaxed text-slate-600">
                      {renderTokens(dist.vibe.caution.tokens as any)}
                    </div>
                  </div>
                </div>



            </>
          )}
        </SectionCard2>

        {/* ✅ 2) 역할 추천 */}
        <SectionCard2
          icon="🎭"
          title={tt("rolesTitle", "모임 역할 추천")}
          subtitle={tt("rolesSubtitle", "누가 어떤 역할에 강한지")}
          tone="emerald"
        >
          {validMbtis.length === 0 ? (
            <p className="mt-1 text-sm text-slate-500">
              {tt("rolesEmpty", "MBTI가 들어오면 “이 방은 어떤 역할이 강한지”가 자동으로 잡혀요.")}
            </p>
          ) : (
            <>
                {/* ✅ Summary card */}
                <div className="mt-3 rounded-2xl border border-slate-200/70 bg-white/88 p-3">
                  <div className="text-xs font-extrabold text-slate-900">{roles.headline}</div>
                  <p className="mt-1 text-xs leading-relaxed text-slate-600">{roles.tip}</p>
                </div>

                {/* ✅ Role grid cards */}
                <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
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
                          "relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white/88 p-3",
                          "shadow-[0_6px_16px_rgba(15,23,42,0.05)]",
                        ].join(" ")}
                      >
                        {/* left accent bar */}
                        <div className={`absolute left-0 top-0 h-full w-1 ${th.leftBar}`} />

                        {/* header */}
                        <div className="flex items-start justify-between gap-2 pl-2">
                          <div className="min-w-0">
                            <div className={`text-xs font-extrabold truncate ${th.accent}`}>
                              {roleLabel(k, t)}
                            </div>
                            <div className="mt-0.5 text-[11px] text-slate-500">
                              {roleDescMessage(k, t)}
                            </div>
                          </div>

                          <div className="shrink-0 pl-2 text-[11px] font-bold text-slate-600">
                            {tt("memberCount", `${list.length}명`, { count: list.length })}
                          </div>
                        </div>

                        {/* 멤버 리스트: 대표는 리스트 안에서만 강조 */}
                        {sorted.length > 0 && (
                          
                          <div className="mt-3 pl-2">
                            <ul className="divide-y divide-black/5 overflow-hidden rounded-xl border border-slate-200/70 bg-white/88">
                              {sorted.slice(0, 5).map((m, idx) => {
                                const rank = fitRankMap.get(m.fit) ?? 999; // 1,2,3...
                                const badge = roleRankBadge(k, rank - 1, t); // roleRankBadge는 0=1등 규칙
                                const isCoFirst = rank === 1;

                                return (
                                  <li
                                    key={`${k}-${m.name}-${m.mbti}`}
                                    className={[
                                      "relative flex items-center justify-between px-3 py-2",
                                      isCoFirst ? "bg-white/85" : ""
                                    ].join(" ")}
                                    title={tt("fitTitle", `적합도 ${m.fit}`, { score: m.fit })}
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
                                        {m.fit}{tt("scoreUnit", "점")}
                                      </div>
                                    </span>

                                  </li>
                                );
                              })}

                            </ul>

                            <RoleMoreListIntl roleKey={k} members={sorted} shown={5} />
                          </div>
                        )}
                        {sorted.length === 0 && (
                          <div className="mt-3 pl-2">
                            <div className="rounded-xl border border-slate-200/70 bg-white/88 px-3 py-3">
                              <div className="text-[11px] font-extrabold text-slate-500">
                                {tt("noTendency", "해당 성향 없음")}
                              </div>
                              <div className="mt-1 text-[11px] text-slate-400 leading-relaxed">
                                {roleEmptyMessage(k, t)}
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

        {/* ✅ 케미 리포트 (랭킹 + 타입요약) */}
        <SectionCard2
          icon="🔍"
          title={tt("reportTitle", "케미 리포트")}
          subtitle={tt("reportSubtitle", "우리모임 조합 랭킹")}
          tone="violet"
        >
          <ChemReportSectionIntl pairs={pairs} />
        </SectionCard2>

        <section className="mt-6">
          <div className="mbti-card-frame rounded-3xl border border-slate-200/70 bg-white/88 p-5 shadow-[0_8px_20px_rgba(15,23,42,0.05)]">
            <p className="text-xs leading-relaxed text-slate-500">
              {tt("footerNote", "※ 결과는 재미를 위한 참고용이에요. 관계 판단/결정의 근거로 사용하지 마세요.")}
            </p>
          </div>
        </section>
      </div>


    </main>
  );
}
