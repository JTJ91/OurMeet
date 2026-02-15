import type { GuideSectionType } from "../../data/mbti/types";
import type { GuidesLocale } from "./listI18n";

export const DETAIL_COPY: Record<
  GuidesLocale,
  {
    systemLabel: { mbti: string; saju: string; main: string };
    guideList: string;
    quickNav: string;
    examplePrefix: string;
    situationPrefix: string;
    sayPrefix: string;
    relatedKicker: string;
    relatedTitle: string;
  }
> = {
  ko: {
    systemLabel: { mbti: "MBTI 홈", saju: "사주 홈", main: "메인" },
    guideList: "가이드 목록",
    quickNav: "바로가기",
    examplePrefix: "예:",
    situationPrefix: "상황:",
    sayPrefix: "이렇게 말해보기:",
    relatedKicker: "RELATED",
    relatedTitle: "같이 보면 좋은 가이드",
  },
  en: {
    systemLabel: { mbti: "MBTI Home", saju: "Saju Home", main: "Home" },
    guideList: "Guide List",
    quickNav: "Quick Jump",
    examplePrefix: "Example:",
    situationPrefix: "Situation:",
    sayPrefix: "Try saying:",
    relatedKicker: "RELATED",
    relatedTitle: "Related Guides",
  },
  ja: {
    systemLabel: { mbti: "MBTIホーム", saju: "四柱ホーム", main: "ホーム" },
    guideList: "ガイド一覧",
    quickNav: "クイック移動",
    examplePrefix: "例:",
    situationPrefix: "状況:",
    sayPrefix: "言い換え例:",
    relatedKicker: "RELATED",
    relatedTitle: "あわせて読むガイド",
  },
};

export const SECTION_LABELS: Record<GuidesLocale, Record<GuideSectionType, string>> = {
  ko: {
    PATTERNS_TOP3: "패턴 TOP3",
    TRIGGERS: "트리거",
    CAUTION: "주의",
    RULES: "운영 룰",
    SCRIPTS: "대체 문장",
    FAQ: "FAQ",
  },
  en: {
    PATTERNS_TOP3: "Top Patterns",
    TRIGGERS: "Triggers",
    CAUTION: "Caution",
    RULES: "Operating Rules",
    SCRIPTS: "Alternative Lines",
    FAQ: "FAQ",
  },
  ja: {
    PATTERNS_TOP3: "主要パターン",
    TRIGGERS: "トリガー",
    CAUTION: "注意点",
    RULES: "運営ルール",
    SCRIPTS: "言い換え文",
    FAQ: "FAQ",
  },
};
