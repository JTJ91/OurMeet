// app/guides/data/types.ts
export type GroupType = "FRIENDS" | "WORK" | "LOCAL" | "SPORTS" | "GAMES";

export const GROUP_META: Record<
  GroupType,
  { label: string; desc: string; anchor: string; badge: string }
> = {
  FRIENDS: { label: "친구 모임", desc: "말 많은데 어색해지는 순간들", anchor: "friends", badge: "👯" },
  WORK: { label: "회사 모임", desc: "회의/업무에서 자주 터지는 포인트", anchor: "work", badge: "💼" },
  LOCAL: { label: "동네 모임", desc: "가벼운 친목에서 갈등을 줄이는 법", anchor: "local", badge: "🏘️" },
  SPORTS: { label: "운동 모임", desc: "루틴/참여/페이스 차이로 생기는 문제", anchor: "sports", badge: "🏃" },
  GAMES: { label: "게임 모임", desc: "티키타카/승부/몰입 차이 관리", anchor: "game", badge: "🎮" },
};

export type GuideSectionType =
  | "PATTERNS_TOP3"
  | "TRIGGERS"
  | "CAUTION"
  | "RULES"
  | "SCRIPTS"
  | "FAQ";
  
  // ✅ 섹션 메타 (TOC/아이콘/앵커 공통으로 씀)
export const SECTION_META: Record<
  GuideSectionType,
  { label: string; badge: string }
> = {
  PATTERNS_TOP3: { label: "패턴 TOP3", badge: "🔥" },
  TRIGGERS: { label: "트리거", badge: "⚠️" },
  CAUTION: { label: "주의", badge: "✅" },
  RULES: { label: "운영 룰", badge: "🧩" },
  SCRIPTS: { label: "대체 문장", badge: "🗣️" },
  FAQ: { label: "FAQ", badge: "❓" },
};


export type GuideSection =
  | {
      type: "PATTERNS_TOP3";
      title: string;
      items: { title: string; when: string; why: string; tip: string }[];
    }
  | {
      type: "TRIGGERS";
      title: string;
      items: { title: string; detail: string }[];
    }
  | {
      type: "CAUTION";
      title: string;
      items: { do: string[]; dont: string[] };
    }
  | {
      type: "RULES";
      title: string;
      items: { title: string; how: string; example?: string }[];
    }
  | {
      type: "SCRIPTS";
      title: string;
      items: { situation: string; say: string; instead?: string }[];
    }
  | {
      type: "FAQ";
      title: string;
      items: { q: string; a: string }[];
    };

export type Guide = {
  slug: string;
  groupType: GroupType;
  title: string;
  description: string;
  keywords?: string[];

  // ✅ 상세페이지는 이 sections만으로 렌더링 (JSX 없음)
  sections: GuideSection[];

  related?: string[]; // 다른 slug들
};

export const SECTION_ID: Record<GuideSectionType, string> = {
  PATTERNS_TOP3: "patterns",
  TRIGGERS: "triggers",
  CAUTION: "caution",
  RULES: "rules",
  SCRIPTS: "scripts",
  FAQ: "faq",
};

