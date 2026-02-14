import type { GroupType } from "../../_data/mbti/types";

export type GuidesLocale = "ko" | "en" | "ja";

export const PAGE_COPY: Record<
  GuidesLocale,
  {
    back: string;
    heroLine1: string;
    heroLine2: string;
    heroDesc: string;
    jump: string;
    read: string;
    top: string;
    countSuffix: string;
  }
> = {
  ko: {
    back: "뒤로가기",
    heroLine1: "모임에서 자주 터지는 순간을",
    heroLine2: "MBTI로 쉽게 정리했어요",
    heroDesc: "친구/회사/동네/운동/게임 같은 현실 모임에서 어떤 조합에서 어떤 오해가 생기는지부터 보시면 됩니다.",
    jump: "바로보기",
    read: "읽기",
    top: "위로",
    countSuffix: "개",
  },
  en: {
    back: "Back",
    heroLine1: "We organized common friction points",
    heroLine2: "in real groups using MBTI",
    heroDesc:
      "Start with where misunderstandings begin in each combination across friend, work, neighborhood, sports, and gaming groups.",
    jump: "Open",
    read: "Read",
    top: "Top",
    countSuffix: "items",
  },
  ja: {
    back: "戻る",
    heroLine1: "集まりで起こりやすい衝突の瞬間を",
    heroLine2: "MBTIでわかりやすく整理しました",
    heroDesc:
      "友だち・会社・地域・運動・ゲームの集まりで、どの組み合わせで誤解が生まれやすいかから確認できます。",
    jump: "見る",
    read: "読む",
    top: "上へ",
    countSuffix: "件",
  },
};

export const GROUP_META_I18N: Record<GuidesLocale, Record<GroupType, { label: string; desc: string }>> = {
  ko: {
    FRIENDS: { label: "친구 모임", desc: "말 많은데 어색해지는 순간들" },
    WORK: { label: "회사 모임", desc: "회의/업무에서 자주 터지는 포인트" },
    LOCAL: { label: "동네 모임", desc: "가벼운 친목에서 갈등을 줄이는 법" },
    SPORTS: { label: "운동 모임", desc: "루틴/참여/페이스 차이로 생기는 문제" },
    GAMES: { label: "게임 모임", desc: "티키타카/승부/몰입 차이 관리" },
  },
  en: {
    FRIENDS: { label: "Friends Group", desc: "Moments when conversation is lively but still turns awkward" },
    WORK: { label: "Work Group", desc: "Common friction points in meetings and day-to-day work" },
    LOCAL: { label: "Neighborhood Group", desc: "How to reduce conflict in casual local gatherings" },
    SPORTS: { label: "Sports Group", desc: "Problems from differences in routine, participation, and pace" },
    GAMES: { label: "Gaming Group", desc: "Managing differences in banter, competition, and immersion" },
  },
  ja: {
    FRIENDS: { label: "友だちグループ", desc: "会話は多いのに気まずくなる瞬間" },
    WORK: { label: "会社グループ", desc: "会議・業務で起きやすい衝突ポイント" },
    LOCAL: { label: "地域グループ", desc: "気軽な交流で摩擦を減らす方法" },
    SPORTS: { label: "運動グループ", desc: "ルーティン・参加姿勢・ペース差で起きる問題" },
    GAMES: { label: "ゲームグループ", desc: "会話ノリ・勝負観・没入度の差を整える方法" },
  },
};
