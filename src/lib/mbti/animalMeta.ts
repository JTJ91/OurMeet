export type AnimalLocale = "ko" | "en" | "ja";

type AnimalMeta = {
  emoji: string;
  name: Record<AnimalLocale, string>;
  reason: Record<AnimalLocale, string>;
};

const MBTI_ANIMAL_META: Record<string, AnimalMeta> = {
  INTJ: {
    emoji: "🦉",
    name: { ko: "부엉이", en: "Owl", ja: "フクロウ" },
    reason: {
      ko: "큰 그림을 먼저 보고 신중하게 전략을 세우는 성향이 강해요.",
      en: "A strategic, far-sighted style with careful planning and broad situational awareness.",
      ja: "全体像を見て慎重に戦略を組み立てる、先見性の高いタイプです。",
    },
  },
  INTP: {
    emoji: "🐙",
    name: { ko: "문어", en: "Octopus", ja: "タコ" },
    reason: {
      ko: "복잡한 문제를 다각도로 탐구하고 유연하게 해결하는 특징이 뚜렷해요.",
      en: "A curious, analytical style that explores complex problems from multiple angles.",
      ja: "複雑な課題を多角的に探究し、柔軟に解いていくタイプです。",
    },
  },
  ENTJ: {
    emoji: "🐺",
    name: { ko: "늑대", en: "Wolf", ja: "オオカミ" },
    reason: {
      ko: "목표를 분명히 두고 역할을 나눠 강하게 추진하는 리더 성향이 강해요.",
      en: "A goal-focused, decisive style with strong leadership and execution.",
      ja: "目標を明確に定め、強い推進力で実行するリーダータイプです。",
    },
  },
  ENTP: {
    emoji: "🦅",
    name: { ko: "매", en: "Falcon", ja: "ハヤブサ" },
    reason: {
      ko: "빠른 판단과 전환으로 기회를 포착하는 감각이 뛰어나요.",
      en: "A quick-thinking, adaptable style that spots opportunities and pivots fast.",
      ja: "判断と切り替えが速く、機会をつかむのが得意なタイプです。",
    },
  },
  INFJ: {
    emoji: "🐬",
    name: { ko: "돌고래", en: "Dolphin", ja: "イルカ" },
    reason: {
      ko: "감정 흐름을 잘 읽고 관계의 조화를 중요하게 여겨요.",
      en: "An empathetic, insightful style that reads emotional flow and values harmony.",
      ja: "感情の流れを読み取り、関係の調和を大切にするタイプです。",
    },
  },
  INFP: {
    emoji: "🦊",
    name: { ko: "붉은여우", en: "Red Fox", ja: "アカギツネ" },
    reason: {
      ko: "섬세한 감수성과 독립적인 자기 방식이 뚜렷해요.",
      en: "A sensitive, independent style with strong personal values and authenticity.",
      ja: "繊細な感性と独自の価値観を大切にするタイプです。",
    },
  },
  ENFJ: {
    emoji: "🦁",
    name: { ko: "사자", en: "Lion", ja: "ライオン" },
    reason: {
      ko: "사람들을 모으고 중심에서 방향을 제시하는 리더십이 돋보여요.",
      en: "A people-centered leadership style that sets direction and energizes groups.",
      ja: "人をまとめて方向性を示す、対人リーダーシップの高いタイプです。",
    },
  },
  ENFP: {
    emoji: "🦜",
    name: { ko: "앵무새", en: "Parrot", ja: "オウム" },
    reason: {
      ko: "호기심이 많고 표현력이 풍부해 분위기를 밝게 만들어요.",
      en: "A curious, expressive style that brings lively energy and positive momentum.",
      ja: "好奇心と表現力が豊かで、場を明るくするタイプです。",
    },
  },
  ISTJ: {
    emoji: "🐘",
    name: { ko: "코끼리", en: "Elephant", ja: "ゾウ" },
    reason: {
      ko: "책임감이 강하고 안정적으로 역할을 지키는 성향이 강해요.",
      en: "A responsible, consistent style that keeps structure stable and reliable.",
      ja: "責任感と一貫性が強く、安定して役割を果たすタイプです。",
    },
  },
  ISFJ: {
    emoji: "🐢",
    name: { ko: "거북이", en: "Turtle", ja: "カメ" },
    reason: {
      ko: "차분하고 꾸준하게 주변을 돌보며 안정감을 주는 특징이 있어요.",
      en: "A calm, steady caregiving style that creates safety and stability.",
      ja: "落ち着いて着実に周囲を支え、安心感をつくるタイプです。",
    },
  },
  ESTJ: {
    emoji: "🦬",
    name: { ko: "들소", en: "Bison", ja: "バイソン" },
    reason: {
      ko: "현실적 기준으로 빠르게 실행하고 강하게 추진하는 힘이 커요.",
      en: "A practical, structured style that executes quickly and pushes results.",
      ja: "現実的な基準で素早く実行し、力強く推進するタイプです。",
    },
  },
  ESFJ: {
    emoji: "🐕",
    name: { ko: "골든 리트리버", en: "Golden Retriever", ja: "ゴールデンレトリバー" },
    reason: {
      ko: "친화력과 배려심이 높아 주변을 편안하게 만드는 성향이 뚜렷해요.",
      en: "A warm, considerate style that supports others and keeps group comfort high.",
      ja: "高い親和性と配慮で、周囲を心地よく整えるタイプです。",
    },
  },
  ISTP: {
    emoji: "🦈",
    name: { ko: "상어", en: "Shark", ja: "サメ" },
    reason: {
      ko: "상황을 빠르게 판단하고 실전적으로 대응하는 능력이 강해요.",
      en: "A tactical, hands-on style that stays composed and responds fast under pressure.",
      ja: "状況判断が速く、実践的に対応するのが得意なタイプです。",
    },
  },
  ISFP: {
    emoji: "🐨",
    name: { ko: "코알라", en: "Koala", ja: "コアラ" },
    reason: {
      ko: "부드러운 감성과 온화한 분위기로 주변을 안정시키는 특징이 있어요.",
      en: "A gentle, warm style that brings calm and emotional steadiness.",
      ja: "やわらかな感性と穏やかさで、周囲を落ち着かせるタイプです。",
    },
  },
  ESTP: {
    emoji: "🐯",
    name: { ko: "호랑이", en: "Tiger", ja: "トラ" },
    reason: {
      ko: "상황을 빠르게 읽고 과감하게 행동으로 옮기는 추진력이 강해요.",
      en: "A bold, action-first style that reads situations quickly and acts decisively.",
      ja: "状況を素早く読み、果敢に行動へ移すタイプです。",
    },
  },
  ESFP: {
    emoji: "🐵",
    name: { ko: "원숭이", en: "Monkey", ja: "サル" },
    reason: {
      ko: "밝고 활발한 에너지로 사람들을 즐겁게 만드는 매력이 커요.",
      en: "A bright, playful style that lifts energy and makes people feel engaged.",
      ja: "明るく活発なエネルギーで、人を楽しませるタイプです。",
    },
  },
};

export function animalMetaOf(mbti: string) {
  const key = (mbti || "").trim().toUpperCase();
  if (!/^[EI][NS][TF][JP]$/.test(key)) return null;
  const meta = MBTI_ANIMAL_META[key];
  if (!meta) return null;
  return { ...meta, imageSrc: `/mbti-animals/${key}.png` };
}
