import type { Metadata } from "next";
import { prisma } from "@/lib/mbti/prisma";
import { notFound } from "next/navigation";
import InviteActionsIntl from "@/features/mbti/components/InviteActions";
import GraphServerIntl from "@/features/mbti/g/[groupId]/GraphServerIntl";
import {
  getCompatScore,
  type ChemType,
  type CompatAdjustBreakdown,
  type CompatReason,
  type Level,
} from "@/lib/mbti/mbtiCompat";
import { unstable_cache } from "next/cache";
import TouchSavedGroupClientIntl from "@/components/TouchSavedGroupClient";
import ChemTopWorstIntl from "@/features/mbti/g/[groupId]/components/ChemTopWorstIntl";
import { normalizeMemberPrefs, type MemberPrefs } from "@/lib/mbti/memberPrefs";
import {
  ROLE_KEYS,
  pickCandidates,
  type ConflictInput,
  type EnergyInput,
  type RoleCandidateInput,
  type RoleKey,
} from "@/lib/mbti/roleScore";


import Link from "next/link";
import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { alternatesForPath } from "@/i18n/metadata";
import { Compass, Sparkles, Zap, ListChecks, Handshake } from "lucide-react";

type TranslateValues = Record<string, string | number | Date>;
type TranslateFn = (key: string, values?: TranslateValues) => string;

function isMeaningfulTranslation(text: string) {
  const trimmed = text.trim();
  if (!trimmed) return false;
  if (/[\p{L}\p{N}]/u.test(trimmed)) return true;
  return /\{[^}]+\}/.test(trimmed);
}

function tx(t: TranslateFn | undefined, key: string, fallback: string, values?: TranslateValues) {
  if (!t) return fallback;
  try {
    const translated = t(key, values);
    return isMeaningfulTranslation(translated) ? translated : fallback;
  } catch {
    return fallback;
  }
}

const isValidMbti = (s?: string | null) => /^[EI][NS][TF][JP]$/i.test((s ?? "").trim());

function pairStableKey(aId: string, bId: string) {
  return aId < bId ? `${aId}|${bId}` : `${bId}|${aId}`;
}

function stablePairHash(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return h;
}

async function getGroupRankingsCacheSeed(groupId: string) {
  const snapshot = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      name: true,
      maxMembers: true,
      createdAt: true,
      members: {
        select: {
          id: true,
          nickname: true,
          mbti: true,
          ideaStrength: true,
          factStrength: true,
          logicStrength: true,
          peopleStrength: true,
          conflictStyle: true,
          energy: true,
        },
      },
    },
  });

  if (!snapshot) return null;

  const membersKey = snapshot.members
    .map(
      (member) =>
        [
          member.id,
          member.nickname,
          member.mbti ?? "",
          member.ideaStrength ?? "",
          member.factStrength ?? "",
          member.logicStrength ?? "",
          member.peopleStrength ?? "",
          member.conflictStyle ?? "",
          member.energy ?? "",
        ].join(":")
    )
    .sort()
    .join("|");
  const membersHash = stablePairHash(membersKey);

  return `${snapshot.createdAt.getTime()}-${snapshot.maxMembers}-${snapshot.name}-${membersHash}`;
}

type JudgeStyle = "LOGIC" | "PEOPLE";
type InfoStyle = "IDEA" | "FACT";
type PairRow = {
  aId: string; aName: string; aMbti: string;
  bId: string; bName: string; bMbti: string;
  scoreInt: number;
  micro: number;
  score: number;
  type: ChemType;
  level: Level;
  adjustTotal?: number;
  adjustBreakdown?: CompatAdjustBreakdown;
  reason?: CompatReason;

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


/** ✅ 1) MBTI 분포 분석 */
type DistributionMember = {
  mbti?: string | null;
  ePercent?: number | null;
  nPercent?: number | null;
  tPercent?: number | null;
  jPercent?: number | null;
};

function summarizeMbtiDistribution(members: DistributionMember[], stableSeed: string) {
  const cnt = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };
  const validMembers: Array<{ e: number; n: number; t: number; j: number }> = [];

  const clampPercent = (value: unknown) => {
    const n = Number(value);
    if (!Number.isFinite(n)) return null;
    return Math.max(0, Math.min(100, Math.round(n)));
  };

  for (const member of members) {
    const t = String(member.mbti ?? "").trim().toUpperCase();
    if (!isValidMbti(t)) continue;
    cnt[t[0] as "E" | "I"]++;
    cnt[t[1] as "N" | "S"]++;
    cnt[t[2] as "T" | "F"]++;
    cnt[t[3] as "J" | "P"]++;

    const e = clampPercent(member.ePercent) ?? 50;
    const n = clampPercent(member.nPercent) ?? 50;
    const tt = clampPercent(member.tPercent) ?? 50;
    const j = clampPercent(member.jPercent) ?? 50;

    validMembers.push({ e, n, t: tt, j });
  }

  const avg = validMembers.reduce(
    (acc, member) => {
      acc.e += member.e;
      acc.n += member.n;
      acc.t += member.t;
      acc.j += member.j;
      return acc;
    },
    { e: 0, n: 0, t: 0, j: 0 }
  );
  const avgE = validMembers.length ? Math.round(avg.e / validMembers.length) : 50;
  const avgN = validMembers.length ? Math.round(avg.n / validMembers.length) : 50;
  const avgT = validMembers.length ? Math.round(avg.t / validMembers.length) : 50;
  const avgJ = validMembers.length ? Math.round(avg.j / validMembers.length) : 50;

  const axisLine = (
    a: keyof typeof cnt,
    b: keyof typeof cnt,
    labelA: string,
    labelB: string,
    leftPercent: number
  ) => {
    const aPct = Math.max(0, Math.min(100, Math.round(leftPercent)));
    const bPct = 100 - aPct;
    const dom = aPct === bPct ? null : (aPct > bPct ? a : b);
    const A = cnt[a];
    const B = cnt[b];

    const diffPct = Math.abs(aPct - bPct); // ✅ 격차 (0~100)

    return {
      a: { key: a, label: labelA, v: aPct, pct: aPct, count: A },
      b: { key: b, label: labelB, v: bPct, pct: bPct, count: B },
      dom,
      diffPct, // ✅ 추가
    };
  };


  const ei = axisLine("E", "I", "E(외향)", "I(내향)", avgE);
  const ns = axisLine("N", "S", "N(직관)", "S(감각)", avgN);
  const tf = axisLine("T", "F", "T(사고)", "F(감정)", avgT);
  const jp = axisLine("J", "P", "J(판단)", "P(인식)", avgJ);


  type VibeBlock = {
    core: { label: string; k: Exclude<AxisKey, "TF"> | "BAL" }[];
    summary: string[];
    scene: TextToken[][];
    caution: { k: AxisKey; tokens: TextToken[] };
  };

  
  const vibe: VibeBlock = (() => {
    const domEI = ei.dom; // "E" | "I" | null
    const domNS = ns.dom; // "N" | "S" | null
    const domTF = tf.dom; // "T" | "F" | null
    const domJP = jp.dom; // "J" | "P" | null

    const isTie = (x: { dom: string | null; diffPct: number }) => x.dom === null || x.diffPct <= 10;
    const strengthTier = (x: { dom: string | null; diffPct: number }) => {
      if (x.dom === null || x.diffPct <= 10) return "tie" as const;
      if (x.diffPct <= 20) return "mild" as const;
      if (x.diffPct <= 35) return "strong" as const;
      return "extreme" as const;
    };
    const pickStable = <T,>(items: T[], tokenGroup: string): T => {
      if (items.length === 1) return items[0];
      const idx = stablePairHash(`${stableSeed}|${tokenGroup}`) % items.length;
      return items[idx];
    };

    const eiTier = strengthTier(ei);
    const nsTier = strengthTier(ns);
    const tfTier = strengthTier(tf);
    const jpTier = strengthTier(jp);

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

    const sceneToken = <D extends string>(axis: "EI" | "NS" | "JP", dom: D | null, tier: "tie" | "mild" | "strong" | "extreme") => {
      if (dom === null || tier === "tie") return `SCENE_${axis}_TIE`;
      return `SCENE_${axis}_${dom}_${tier.toUpperCase()}`;
    };

    const summaryVariantsByCombo: Record<string, string[][]> = {
      ENP: [
        ["SUMMARY_ENP_A1", "SUMMARY_ENP_A2"],
        ["SUMMARY_ENP_B1", "SUMMARY_ENP_B2"],
      ],
      ENJ: [
        ["SUMMARY_ENJ_A1", "SUMMARY_ENJ_A2"],
        ["SUMMARY_ENJ_B1", "SUMMARY_ENJ_B2"],
      ],
      ESP: [
        ["SUMMARY_ESP_A1", "SUMMARY_ESP_A2"],
        ["SUMMARY_ESP_B1", "SUMMARY_ESP_B2"],
      ],
      ESJ: [
        ["SUMMARY_ESJ_A1", "SUMMARY_ESJ_A2"],
        ["SUMMARY_ESJ_B1", "SUMMARY_ESJ_B2"],
      ],
      INP: [
        ["SUMMARY_INP_A1", "SUMMARY_INP_A2"],
        ["SUMMARY_INP_B1", "SUMMARY_INP_B2"],
      ],
      INJ: [
        ["SUMMARY_INJ_A1", "SUMMARY_INJ_A2"],
        ["SUMMARY_INJ_B1", "SUMMARY_INJ_B2"],
      ],
      ISP: [
        ["SUMMARY_ISP_A1", "SUMMARY_ISP_A2"],
        ["SUMMARY_ISP_B1", "SUMMARY_ISP_B2"],
      ],
      ISJ: [
        ["SUMMARY_ISJ_A1", "SUMMARY_ISJ_A2"],
        ["SUMMARY_ISJ_B1", "SUMMARY_ISJ_B2"],
      ],
    };

    const summary = (() => {
      if (domEI && domNS && domJP) {
        const combo = `${domEI}${domNS}${domJP}`;
        const variants = summaryVariantsByCombo[combo];
        if (variants?.length) {
          return pickStable(variants, `SUMMARY_COMBO_${combo}`);
        }
      }

      const fbEins = `SUMMARY_FB_EINS_${domEI ?? "X"}_${domNS ?? "X"}`;
      const fbNsjp = `SUMMARY_FB_NSJP_${domNS ?? "X"}_${domJP ?? "X"}`;
      return [fbEins, fbNsjp];
    })();

    const scene: TextToken[][] = [
      [H(sceneToken("EI", domEI, eiTier), "EI")],
      [H(sceneToken("NS", domNS, nsTier), "NS")],
      [H(sceneToken("JP", domJP, jpTier), "JP")],
    ];

    const caution = (() => {
      const hasExtreme = [eiTier, nsTier, tfTier, jpTier].includes("extreme");
      if (!isTie(tf)) {
        if (domTF === "T") {
          return {
            k: "TF" as const,
            tokens: [T(tfTier === "extreme" ? "CAUTION_T_EXTREME" : "CAUTION_T_BASE")],
          };
        }
        if (domTF === "F") {
          return {
            k: "TF" as const,
            tokens: [T(tfTier === "extreme" ? "CAUTION_F_EXTREME" : "CAUTION_F_BASE")],
          };
        }
      }

      if (!isTie(jp) && domJP === "P") {
        return {
          k: "JP" as const,
          tokens: [T(jpTier === "extreme" ? "CAUTION_P_EXTREME" : "CAUTION_P_BASE")],
        };
      }

      return {
        k: "BAL" as const,
        tokens: [T(hasExtreme ? "CAUTION_DEFAULT_EXTREME" : "CAUTION_DEFAULT_BASE")],
      };
    })();

    return { core, summary, scene, caution };
  })();




  return { cnt, ei, ns, tf, jp, vibe, avgAxis: { e: avgE, n: avgN, t: avgT, j: avgJ } };
}

/** ✅ 2) 역할 추천 (방 전체) */
function roleLabel(r: RoleKey, t?: TranslateFn) {
  switch (r) {
    case "STRATEGY": return tx(t, "roles.labels.STRATEGY", "전략 담당");
    case "VIBE": return tx(t, "roles.labels.VIBE", "분위기 담당");
    case "EXEC": return tx(t, "roles.labels.EXEC", "실행 담당");
    case "ORGANIZE": return tx(t, "roles.labels.ORGANIZE", "정리/결정 담당");
    case "MEDIATOR": return tx(t, "roles.labels.MEDIATOR", "중재/조율 담당");
  }
}

function roleTheme(k: RoleKey) {
  switch (k) {
    case "STRATEGY":
      return {
        accent: "text-fuchsia-700",
        leftBar: "bg-fuchsia-500",
        surface: "from-fuchsia-100/70 via-white to-white",
      };
    case "VIBE":
      return {
        accent: "text-sky-700",
        leftBar: "bg-sky-500",
        surface: "from-sky-100/70 via-white to-white",
      };
    case "EXEC":
      return {
        accent: "text-emerald-700",
        leftBar: "bg-emerald-500",
        surface: "from-emerald-100/70 via-white to-white",
      };
    case "ORGANIZE":
      return {
        accent: "text-amber-700",
        leftBar: "bg-amber-500",
        surface: "from-amber-100/70 via-white to-white",
      };
    case "MEDIATOR":
      return {
        accent: "text-rose-700",
        leftBar: "bg-rose-500",
        surface: "from-rose-100/70 via-white to-white",
      };
  }
}

function roleIconOf(role: RoleKey) {
  if (role === "STRATEGY") return Compass;
  if (role === "VIBE") return Sparkles;
  if (role === "EXEC") return Zap;
  if (role === "ORGANIZE") return ListChecks;
  return Handshake;
}

function stablePick<T>(seed: string, items: T[]) {
  return items[stablePairHash(seed) % items.length];
}

function strongRoleLine(role: RoleKey, locale: string, seed: string) {
  const ko: Record<RoleKey, string[]> = {
    STRATEGY: ["복잡한 이슈도 구조를 잡아주는 타입이 있어요.", "판을 먼저 정리해 흐름을 안정시켜요.", "기준선을 세워 회의 방향이 흔들리지 않게 해요."],
    VIBE: ["어색한 분위기를 빠르게 녹여주는 타입이 있어요.", "사람 사이 연결이 좋아 협업 텐션이 올라가요.", "대화가 끊기지 않게 리듬을 만들어줘요."],
    EXEC: ["결정되면 바로 움직이는 타입이 있어요.", "실행 전환 속도가 빨라 지체가 적어요.", "아이디어를 액션으로 바꾸는 힘이 강해요."],
    ORGANIZE: ["결론을 깔끔하게 묶어 마무리해줘요.", "우선순위를 세워 회의를 짧게 끝내줘요.", "핵심만 남기고 정리해 다음 단계가 선명해져요."],
    MEDIATOR: ["온도 차를 줄여 대화를 이어주는 타입이 있어요.", "입장 차이를 부드럽게 조율해줘요.", "충돌 조짐이 보여도 빠르게 완충해줘요."],
  };
  const en: Record<RoleKey, string[]> = {
    STRATEGY: ["Someone here structures complex topics clearly.", "They stabilize flow by framing first.", "They set criteria so discussions stay on track."],
    VIBE: ["Someone here quickly warms up awkward moments.", "They raise collaboration energy by connecting people.", "They keep conversation rhythm from stalling."],
    EXEC: ["Someone here moves right after decisions.", "The switch from idea to action is fast.", "They convert plans into execution momentum."],
    ORGANIZE: ["Someone here closes discussions cleanly.", "They set priorities and shorten meeting length.", "They leave only what matters for next steps."],
    MEDIATOR: ["Someone here smooths temperature gaps.", "They bridge different positions softly.", "They buffer early conflict signals quickly."],
  };
  const ja: Record<RoleKey, string[]> = {
    STRATEGY: ["複雑な議題でも構造化して整理できる人がいます。", "先に枠組みを作って議論を安定させます。", "判断基準を置いて流れのブレを減らします。"],
    VIBE: ["空気を和らげて会話を始める人がいます。", "人同士の接続が強く協業テンションを上げます。", "会話のリズムを切らさず維持します。"],
    EXEC: ["決定後すぐ動ける人がいます。", "アイデアから実行への切替が速いです。", "計画を実行へ押し出す力が強いです。"],
    ORGANIZE: ["結論をきれいにまとめて締められる人がいます。", "優先順位を立てて会議時間を短くします。", "要点を残して次工程を明確にします。"],
    MEDIATOR: ["温度差を埋めて会話をつなげる人がいます。", "立場の違いをやわらかく調整できます。", "衝突の兆しを早めに緩衝します。"],
  };
  const pool = locale === "en" ? en[role] : locale === "ja" ? ja[role] : ko[role];
  return stablePick(`${seed}|strong`, pool);
}

function vacancyInsightLine(role: RoleKey, locale: string, seed: string) {
  const ko: Record<RoleKey, string[]> = {
    STRATEGY: ["장기 계획은 약할 수 있어요. 목표를 먼저 합의하면 좋아요.", "큰그림이 비기 쉬워요. 시작 전에 성공 기준 1개만 맞춰보세요."],
    VIBE: ["분위기 완충이 약할 수 있어요. 발언 순서를 한 번만 정하면 안정돼요.", "대화 연결이 끊길 수 있어요. 체크인 멘트를 짧게 넣어보세요."],
    EXEC: ["실행 전환이 늦어질 수 있어요. 마감과 담당을 먼저 고정해보세요.", "좋은 아이디어가 쌓이기만 할 수 있어요. 오늘 할 1개를 바로 정해보세요."],
    ORGANIZE: ["결론 고정이 늦어질 수 있어요. 결정 타임박스를 먼저 걸어두세요.", "우선순위가 흔들릴 수 있어요. 중요도 기준을 한 줄로 정해보세요."],
    MEDIATOR: ["갈등 시 중간 조율이 부족할 수 있어요. 룰을 한 줄만 정해두면 안정돼요.", "온도 차가 커질 수 있어요. 피드백 전에 쿠션 문장을 합의해두세요."],
  };
  const en: Record<RoleKey, string[]> = {
    STRATEGY: ["Long-range framing may be weak. Align one goal first.", "Big-picture planning may thin out. Set one success criterion before starting."],
    VIBE: ["Mood buffering may be light. A simple speaking order can stabilize flow.", "Conversation linking may break. Add a short check-in prompt."],
    EXEC: ["Action switch may slow. Lock owner and deadline first.", "Ideas may pile up. Commit one task for today immediately."],
    ORGANIZE: ["Closure may be delayed. Set a decision timebox early.", "Priorities may drift. Define one-line priority rule first."],
    MEDIATOR: ["Mid-conflict coordination may be weak. One shared rule can stabilize flow.", "Temperature gaps may widen. Agree on one cushioning line before feedback."],
  };
  const ja: Record<RoleKey, string[]> = {
    STRATEGY: ["長期設計が弱くなる可能性があります。先に目標を1つ合意してください。", "大枠が空きやすいです。開始前に成功基準を1つだけ固定すると安定します。"],
    VIBE: ["雰囲気緩衝が弱くなる可能性があります。発言順を1回決めるだけで安定します。", "会話接続が切れやすいです。短いチェックイン文を入れてください。"],
    EXEC: ["実行切替が遅れる可能性があります。担当と締切を先に固定してください。", "良案が積まれやすいです。今日やる1つを先に決めてください。"],
    ORGANIZE: ["結論固定が遅れる可能性があります。決定タイムボックスを先に置いてください。", "優先順位がぶれやすいです。重要度基準を1行で定義してください。"],
    MEDIATOR: ["衝突時の中間調整が不足する可能性があります。共通ルール1つで安定します。", "温度差が広がりやすいです。フィードバック前のクッション文を合意してください。"],
  };
  const pool = locale === "en" ? en[role] : locale === "ja" ? ja[role] : ko[role];
  return stablePick(`${seed}|vacancy`, pool);
}

function rolePersonaTitle(role: RoleKey, locale: string) {
  if (locale === "en") {
    const en: Record<RoleKey, string> = {
      STRATEGY: "Map Mastermind",
      VIBE: "Mood DJ",
      EXEC: "Turbo Starter",
      ORGANIZE: "Deadline Tamer",
      MEDIATOR: "Peace Buffer",
    };
    return en[role];
  }
  if (locale === "ja") {
    const ja: Record<RoleKey, string> = {
      STRATEGY: "作戦ボ스",
      VIBE: "ムードDJ",
      EXEC: "爆速スターター",
      ORGANIZE: "締切ハンター",
      MEDIATOR: "平和バッファー",
    };
    return ja[role];
  }
  const ko: Record<RoleKey, string> = {
    STRATEGY: "전략설계자",
    VIBE: "분위기 메이커",
    EXEC: "실행 엔진",
    ORGANIZE: "정리왕",
    MEDIATOR: "평화 유지군",
  };
  return ko[role];
}


type RoleMemberSource = {
  id: string;
  nickname: string;
  mbti?: string | null;
  ePercent?: number | null;
  nPercent?: number | null;
  tPercent?: number | null;
  jPercent?: number | null;
  conflictStyle?: string | null;
  energy?: string | number | null;
};

function mbtiAxisFallback(mbti: string) {
  return {
    E: mbti[0] === "E" ? 100 : 0,
    N: mbti[1] === "N" ? 100 : 0,
    T: mbti[2] === "T" ? 100 : 0,
    J: mbti[3] === "J" ? 100 : 0,
  };
}

function normalizeAxisValue(value: number | null | undefined, fallback: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, n));
}

function normalizeConflictInput(value: string | null | undefined): ConflictInput {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === "DIRECT" || raw === "AVOID" || raw === "MEDIATE" || raw === "BURST") return raw;
  return null;
}

function normalizeEnergyInput(value: string | number | null | undefined): EnergyInput {
  if (value === 1 || value === 2 || value === 3) return value;
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === "LOW") return 1;
  if (raw === "MID") return 2;
  if (raw === "HIGH") return 3;
  return null;
}

function pickRolesForGroup(members: RoleMemberSource[]) {
  type RoleCandidateWithId = RoleCandidateInput & { id: string };

  const validMembers: RoleCandidateWithId[] = members
    .map((member) => {
      const mbti = String(member.mbti ?? "").trim().toUpperCase();
      if (!isValidMbti(mbti)) return null;
      const fallbackAxis = mbtiAxisFallback(mbti);
      return {
        id: member.id,
        name: member.nickname,
        mbti,
        axis: {
          E: normalizeAxisValue(member.ePercent, fallbackAxis.E),
          N: normalizeAxisValue(member.nPercent, fallbackAxis.N),
          T: normalizeAxisValue(member.tPercent, fallbackAxis.T),
          J: normalizeAxisValue(member.jPercent, fallbackAxis.J),
        },
        conflict: normalizeConflictInput(member.conflictStyle),
        energy: normalizeEnergyInput(member.energy),
      };
    })
    .filter((member): member is RoleCandidateWithId => !!member);

  const bucket = ROLE_KEYS.reduce(
    (acc, role) => {
      acc[role] = pickCandidates(role, validMembers).map((member) => ({
        id: member.id ?? `${member.name}|${member.mbti}`,
        name: member.name,
        mbti: member.mbti,
        fit: member.score,
      }));
      return acc;
    },
    {
      STRATEGY: [],
      VIBE: [],
      EXEC: [],
      ORGANIZE: [],
      MEDIATOR: [],
    } as Record<RoleKey, { id: string; name: string; mbti: string; fit: number }[]>
  );

  return { bucket };
}

/** ✅ 3) 케미 타입 분류 (점수 기반 + 약간의 위트) */

//** ✅ cached rankings (groupId 별 캐시 분리 + best/worst 안정 계산) */
const getRankings = (groupId: string, cacheSeed: string) =>
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

          const compat = getCompatScore(a.id, a.mbti, b.id, b.mbti, a.prefs, b.prefs);

          pairs.push({
            aId: a.id,
            aName: a.nickname,
            aMbti: a.mbti,
            bId: b.id,
            bName: b.nickname,
            bMbti: b.mbti,
            scoreInt: compat.scoreInt,
            micro: compat.micro,
            score: compat.score,
            type: compat.type,
            level: compat.level,
            adjustTotal: compat.adjustTotal,
            adjustBreakdown: compat.adjustBreakdown,
            reason: compat.reason,
            aPrefs: a.prefs,
            bPrefs: b.prefs,
          });
        }
      }

      // ✅ 안정 정렬(점수 동률일 때 aId/bId로 고정)
      const sortedDesc = [...pairs].sort((x, y) => {
        if (y.score !== x.score) return y.score - x.score;
        const hx = stablePairHash(pairStableKey(x.aId, x.bId));
        const hy = stablePairHash(pairStableKey(y.aId, y.bId));
        return hx - hy;
      });

      const sortedAsc = [...pairs].sort((x, y) => {
        if (x.score !== y.score) return x.score - y.score;
        const hx = stablePairHash(pairStableKey(x.aId, x.bId));
        const hy = stablePairHash(pairStableKey(y.aId, y.bId));
        return hx - hy;
      });

      const best3 = sortedDesc.slice(0, 3);
      const worst3 = sortedAsc.slice(0, 3);

      return { group, best3, worst3 };
    },
    // ✅ groupId를 캐시 키에 포함 (그룹별 캐시 완전 분리)
    ["group-rankings", groupId, cacheSeed],
    {
      revalidate: 60,
      tags: [`group-rankings:${groupId}`],
    }
  )();


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
  const tt = (key: string, fallback: string, values?: TranslateValues) => tx(t, key, fallback, values);
  const sp = (await searchParams) ?? {};
  const centerId = sp.center;
  const base = locale === "ko" ? "" : `/${locale}`;

  const cacheSeed = await getGroupRankingsCacheSeed(groupId);
  if (!cacheSeed) return notFound();

  const cached = await getRankings(groupId, cacheSeed);
  if (!cached) return notFound();

  const { group, best3, worst3 } = cached;

  const count = group.members.length;
  const max = group.maxMembers;
  const ratio = max > 0 ? Math.min(100, Math.round((count / max) * 100)) : 0;

  // ✅ 추가 콘텐츠 계산(서버에서 한번만)
  const validMbtis = group.members
    .map((m) => (m.mbti ?? "").trim().toUpperCase())
    .filter(isValidMbti);

  const distMembers = group.members
    .filter((m) => isValidMbti(m.mbti))
    .map((m) => ({
      mbti: (m.mbti ?? "").trim().toUpperCase(),
      ePercent: m.ePercent,
      nPercent: m.nPercent,
      tPercent: m.tPercent,
      jPercent: m.jPercent,
    }));

  const distTotal = distMembers.length || 1;
  const pctPeople = (n: number) => Math.round((n / distTotal) * 100);
  const fracText2 = (n: number) => tt("countFormat", `${n}/${distTotal}명 (${pctPeople(n)}%)`, { value: n, total: distTotal, percent: pctPeople(n) });
  const distShareLabel =
    locale === "en" ? "Member share" : locale === "ja" ? "人数比率" : "인원 비율";
  const vibeSeed = `${groupId}|${group.members.map((member) => member.id).sort().join("|")}`;

  const dist = summarizeMbtiDistribution(distMembers, vibeSeed);
  if (process.env.NODE_ENV === "development") {
    console.log("✔ Axis percent avg:", dist.avgAxis.e, dist.avgAxis.n, dist.avgAxis.t, dist.avgAxis.j);
  }

  dist.ei.a.label = tt("distribution.axisLabels.eiE", "E(외향)");
  dist.ei.b.label = tt("distribution.axisLabels.eiI", "I(내향)");
  dist.ns.a.label = tt("distribution.axisLabels.nsN", "N(직관)");
  dist.ns.b.label = tt("distribution.axisLabels.nsS", "S(감각)");
  dist.tf.a.label = tt("distribution.axisLabels.tfT", "T(사고)");
  dist.tf.b.label = tt("distribution.axisLabels.tfF", "F(감정)");
  dist.jp.a.label = tt("distribution.axisLabels.jpJ", "J(판단)");
  dist.jp.b.label = tt("distribution.axisLabels.jpP", "P(인식)");

  const coreTokenMap: Record<string, string> = {
    "상황형": tt("distribution.vibe.core.situational", "상황형"),
    "토크형": tt("distribution.vibe.core.talkative", "토크형"),
    "조용한 핵심형": tt("distribution.vibe.core.quietCore", "조용한 핵심형"),
    "균형 감각": tt("distribution.vibe.core.balanceSense", "균형 감각"),
    "아이디어 폭주": tt("distribution.vibe.core.ideaRush", "아이디어 폭주"),
    "현실 결론": tt("distribution.vibe.core.practicalConclusion", "현실 결론"),
    "유연 운영": tt("distribution.vibe.core.flexibleOps", "유연 운영"),
    "정리 담당 존재": tt("distribution.vibe.core.organizerPresent", "정리 담당 존재"),
    "즉흥 운영": tt("distribution.vibe.core.impromptuOps", "즉흥 운영"),
  };
  const mapVibeText = (value: string) => {
    if (coreTokenMap[value]) return coreTokenMap[value];
    if (value.startsWith("SCENE_") || value.startsWith("SUMMARY_") || value.startsWith("CAUTION_")) {
      return tt(`distribution.vibe.tokens.${value}`, value);
    }
    return value;
  };
  dist.vibe.core = dist.vibe.core.map((c) => ({ ...c, label: mapVibeText(c.label) }));
  dist.vibe.summary = dist.vibe.summary.map((line) => mapVibeText(line));
  dist.vibe.scene = dist.vibe.scene.map((line) => line.map((token) => ({ ...token, t: mapVibeText(token.t) })));
  dist.vibe.caution.tokens = dist.vibe.caution.tokens.map((token) => ({ ...token, t: mapVibeText(token.t) }));

  const roles = pickRolesForGroup(
    group.members
      .filter((m) => isValidMbti(m.mbti))
      .map((m) => ({
        id: m.id,
        nickname: m.nickname,
        mbti: m.mbti,
        ePercent: m.ePercent,
        nPercent: m.nPercent,
        tPercent: m.tPercent,
        jPercent: m.jPercent,
        conflictStyle: m.conflictStyle,
        energy: m.energy,
      }))
  );

  const roleCards = ROLE_KEYS.map((role) => {
    const list = [...roles.bucket[role]].sort((a, b) => b.fit - a.fit);
    const top = list[0] ?? null;
    const seed = `${groupId}|${role}|${top?.id ?? "empty"}`;
    return { role, list, top, seed };
  });

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
  
  const axisToChar: Record<Exclude<AxisKey, "BAL">, "E" | "I" | "N" | "S" | "T" | "F" | "J" | "P"> = {
    EI: dist.ei.dom === "I" ? "I" : "E",
    NS: dist.ns.dom === "S" ? "S" : "N",
    TF: dist.tf.dom === "F" ? "F" : "T",
    JP: dist.jp.dom === "P" ? "P" : "J",
  };

  const axisColor = (k: AxisKey) => {
    if (k === "BAL") return "#64748B"; // slate-500
    return MBTI_COLOR[axisToChar[k]];
  };

  function renderTokens(tokens: TextToken[]) {
    return tokens.map((x, i) =>
      "k" in x ? (
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
                    const axisTotal = row.a.count + row.b.count || 1;
                    const sharePct = (count: number) => Math.round((count / axisTotal) * 100);

                    // ✅ 인원 비율이 많은 쪽을 위(first)로
                    const first = row.a.count >= row.b.count ? row.a : row.b;
                    const second = row.a.count >= row.b.count ? row.b : row.a;

                    const firstPct = sharePct(first.count);
                    const secondPct = sharePct(second.count);

                    // ✅ gap을 먼저 선언!
                    const gap = Math.abs(firstPct - secondPct);

                    const axisKey =
                      row.title === tt("distribution.axisTitles.energy", "에너지") ? ("EI" as const) :
                      row.title === tt("distribution.axisTitles.info", "정보") ? ("NS" as const) :
                      row.title === tt("distribution.axisTitles.judgement", "판단") ? ("TF" as const) :
                      ("JP" as const);

                    const isTie = first.count === second.count;

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
                            {distShareLabel} · {fracText2(first.count)}
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
                            {distShareLabel} · {fracText2(second.count)}
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

                  <div className="mt-2 text-[11px] font-extrabold text-slate-600">
                    {tt("distribution.vibe.summaryTitle", "핵심 운영 요약")}
                  </div>
                  <div className="mt-1 space-y-1.5 text-xs leading-relaxed text-slate-700">
                    {dist.vibe.summary.map((line, i) => (
                      <div key={`vibe-summary-${i}`}>• {line}</div>
                    ))}
                  </div>

                  {/* ✅ 장면 문장들: 핵심 단어만 색/굵게 */}
                  <div className="mt-2 space-y-1.5 text-xs leading-relaxed text-slate-600">
                    {dist.vibe.scene.map((line, i) => (
                      <div key={i}>• {renderTokens(line)}</div>
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
                      {renderTokens(dist.vibe.caution.tokens)}
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
              <div className="mt-3 grid grid-cols-1 gap-2">
                {roleCards.map((card) => {
                  const th = roleTheme(card.role);
                  const RoleIcon = roleIconOf(card.role);
                  const top = card.top;
                  const line = top
                    ? strongRoleLine(card.role, locale, card.seed)
                    : vacancyInsightLine(card.role, locale, `${card.seed}|insight`);

                  return (
                    <div
                      key={card.role}
                      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-3 pl-4"
                    >
                      <div className={`absolute left-0 top-0 h-full w-1.5 rounded-r-lg ${th.leftBar}`} />
                      <div className="flex items-center justify-between gap-2">
                        <span className={`truncate text-[15px] font-black ${th.accent}`}>{roleLabel(card.role, t)}</span>
                      </div>
                      <div className="mt-1 text-[11px] leading-relaxed text-slate-500">{line}</div>

                      <div className="mt-2 overflow-hidden rounded-xl border border-slate-200/80 bg-white">
                        {!top ? (
                          <div className="px-3 py-2 text-[11px] font-bold text-slate-500">
                            {tt("roles.snapshotEmptyRole", "현재 모임에서 비어있는 역할")}
                          </div>
                        ) : (
                          <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-2.5 py-2">
                            <div className="min-w-0 truncate text-sm font-black text-slate-800">
                              {top.name}
                              <span className="mx-1 text-slate-300">·</span>
                              <span className="text-[13px] text-slate-600">{top.mbti}</span>
                            </div>
                            <div className="text-right">
                              <div className={`inline-flex items-center gap-1 text-[11px] font-black ${th.accent}`}>
                                <RoleIcon className="h-3.5 w-3.5" aria-hidden />
                                <span>{rolePersonaTitle(card.role, locale)}</span>
                              </div>
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
