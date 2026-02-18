"use client";

import { useMemo, useRef, useState } from "react";
import { QUESTIONS } from "@/lib/mbtiTest/questions";
import { scoreMbti, type Answers, type MbtiTestResult } from "@/lib/mbtiTest/score";
import { useRouter, useSearchParams } from "next/navigation";

type Locale = "ko" | "en" | "ja";

type Props = {
  locale?: string;
};

type ShareStatus = "idle" | "copied";

const UI_TEXT: Record<
  Locale,
  {
    scale: readonly { v: 1 | 2 | 3 | 4 | 5; label: string }[];
    resultTitle: string;
    retry: string;
    createWithResult: string;
    useResult: string;
    reset: string;
    accuracy: string;
    autoNextHint: string;
    shareResult: string;
    copied: string;
    shareTextPrefix: string;
    shareImageSaved: string;
  }
> = {
  ko: {
    scale: [
      { v: 1, label: "전혀 아니다" },
      { v: 2, label: "아니다" },
      { v: 3, label: "보통" },
      { v: 4, label: "그렇다" },
      { v: 5, label: "매우 그렇다" },
    ],
    resultTitle: "검사 결과",
    retry: "다시하기",
    createWithResult: "이 검사결과로 방 만들기",
    useResult: "이 검사결과 사용하기",
    reset: "초기화",
    accuracy: "정확도",
    autoNextHint: "※ 답을 누르면 자동으로 다음 문항으로 이동합니다.",
    shareResult: "결과 공유",
    copied: "복사됨",
    shareTextPrefix: "내 MBTI 검사 결과",
    shareImageSaved: "이미지 저장됨",
  },
  en: {
    scale: [
      { v: 1, label: "Strongly disagree" },
      { v: 2, label: "Disagree" },
      { v: 3, label: "Neutral" },
      { v: 4, label: "Agree" },
      { v: 5, label: "Strongly agree" },
    ],
    resultTitle: "Test Result",
    retry: "Retake",
    createWithResult: "Create group with this result",
    useResult: "Use this result",
    reset: "Reset",
    accuracy: "Confidence",
    autoNextHint: "* Selecting an answer automatically moves to the next question.",
    shareResult: "Share Result",
    copied: "Copied",
    shareTextPrefix: "My MBTI test result",
    shareImageSaved: "Image saved",
  },
  ja: {
    scale: [
      { v: 1, label: "まったくそう思わない" },
      { v: 2, label: "そう思わない" },
      { v: 3, label: "どちらでもない" },
      { v: 4, label: "そう思う" },
      { v: 5, label: "とてもそう思う" },
    ],
    resultTitle: "診断結果",
    retry: "もう一度",
    createWithResult: "この結果でグループ作成",
    useResult: "この結果を使う",
    reset: "リセット",
    accuracy: "信頼度",
    autoNextHint: "※ 回答を選ぶと自動で次の質問に進みます。",
    shareResult: "結果を共有",
    copied: "コピー完了",
    shareTextPrefix: "私のMBTI診断結果",
    shareImageSaved: "画像を保存",
  },
};

const TRAIT_COLOR: Record<string, string> = {
  E: "#FF6B6B",
  I: "#4D96FF",
  N: "#9B59B6",
  S: "#2ECC71",
  T: "#F39C12",
  F: "#E84393",
  J: "#2D3436",
  P: "#16A085",
};

const TRAIT_ONE_LINER: Record<Locale, Record<string, string>> = {
  ko: {
    E: "사람·활동 속에서 에너지를 얻는 외향 성향.",
    I: "혼자만의 시간에서 에너지를 회복하는 내향 성향.",
    N: "가능성과 아이디어를 먼저 보는 직관 성향.",
    S: "경험과 현실 정보를 중시하는 감각 성향.",
    T: "논리와 원칙을 기준으로 판단하는 사고 성향.",
    F: "사람과 감정을 기준으로 판단하는 감정 성향.",
    J: "계획을 세우고 정리하는 것을 선호하는 성향.",
    P: "유연하게 상황에 맞추는 것을 선호하는 성향.",
  },
  en: {
    E: "Extraverted: gains energy from people and activity.",
    I: "Introverted: recharges through alone time.",
    N: "Intuitive: focuses first on ideas and possibilities.",
    S: "Sensing: values practical facts and real experience.",
    T: "Thinking: decides based on logic and principles.",
    F: "Feeling: decides based on people and emotions.",
    J: "Judging: prefers planning and structure.",
    P: "Perceiving: prefers flexibility and adaptation.",
  },
  ja: {
    E: "外向型: 人や活動の中でエネルギーを得る傾向。",
    I: "内向型: 一人の時間でエネルギーを回復する傾向。",
    N: "直観型: 可能性やアイデアを先に見る傾向。",
    S: "感覚型: 現実的な情報や経験を重視する傾向。",
    T: "思考型: 論理と基準で判断する傾向。",
    F: "感情型: 人や気持ちを基準に判断する傾向。",
    J: "判断型: 計画して整えることを好む傾向。",
    P: "知覚型: 柔軟に状況へ合わせることを好む傾向。",
  },
};

type AnimalMeta = {
  emoji: string;
  name: Record<Locale, string>;
  reason: Record<Locale, string>;
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
    name: { ko: "바이슨", en: "Bison", ja: "バイソン" },
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

function animalMetaOf(mbti: string) {
  const key = (mbti || "").trim().toUpperCase();
  if (!/^[EI][NS][TF][JP]$/.test(key)) return null;
  const meta = MBTI_ANIMAL_META[key];
  if (!meta) return null;
  return { ...meta, imageSrc: `/mbti-animals/${key}.png` };
}

const QUESTION_TEXT: Record<Locale, Record<string, string>> = {
  ko: {},
  en: {
    q01: "At gatherings, I often start conversations first.",
    q02: "In group settings, I naturally become more of a listener.",
    q03: "Even if my thoughts are not fully organized, talking helps me organize them.",
    q04: "Before speaking, I organize my thoughts in my head first.",
    q05: "Meeting new people feels more exciting than stressful.",
    q06: "Spending a long time with unfamiliar people drains my energy quickly.",
    q07: "In group chats or gatherings, I tend to make the first suggestion.",
    q08: "In group chats or gatherings, it takes me time before I speak.",
    q09: "If I stay home all weekend, I start to feel restless.",
    q10: "On weekends, resting alone feels better than meeting people.",
    q11: "I do not mind lively, noisy group settings.",
    q12: "Quiet conversations in a small group feel much more comfortable.",
    q13: "I tend to ask questions easily even to people I just met.",
    q14: "Starting a conversation with someone I just met feels burdensome.",
    q15: "When a spontaneous meetup comes up, my first reaction is 'let's go'.",
    q16: "In conversation, what it means in the end feels more important.",
    q17: "In conversation, what exactly happened feels more important.",
    q18: "When listening to explanations, I am more comfortable grasping the big picture first.",
    q19: "When listening to explanations, I need examples or cases to really get it.",
    q20: "When I hear one story, many related ideas come to mind.",
    q21: "When I hear a new idea, I first check whether it is realistic.",
    q22: "While listening, I tend to think about the hidden intention behind the words.",
    q23: "While listening, I tend to take words at face value.",
    q24: "When there is a rule, I first wonder why it was made that way.",
    q25: "When there is a rule, I first wonder how to follow it.",
    q26: "Even if a conversation is somewhat vague, I am fine if I understand the flow.",
    q27: "If a conversation is vague, I want to clarify it with concrete details.",
    q28: "Even when there is a right answer, I keep thinking of better ways.",
    q29: "I feel more at ease when I follow proven methods.",
    q30: "I enjoy hypothetical what-if conversations.",
    q31: "When deciding, I first think about who is objectively right.",
    q32: "When deciding, I first think about who might get hurt.",
    q33: "For feedback, accuracy matters more than sounding nice.",
    q34: "In feedback, tone and wording often matter more than content.",
    q35: "In an argument, reaching a conclusion comes before emotions.",
    q36: "In an argument, atmosphere and relationship come before conclusion.",
    q37: "Even with close people, I speak up right away if something is inefficient.",
    q38: "With close people, I tend to express criticism indirectly.",
    q39: "When I hear explanations, I first check whether the logic is sound.",
    q40: "When I hear explanations, I first sense how that person feels.",
    q41: "When things are urgent, I tend to make decisions even if feelings get hurt a bit.",
    q42: "Even when urgent, I feel it is a bigger loss if people get emotionally hurt.",
    q43: "When problems happen, I look for the cause first.",
    q44: "When problems happen, I check people's emotional state first.",
    q45: "In judgment, fair criteria matter more than personal circumstances.",
    q46: "I feel at ease only when appointments have a fixed date and time.",
    q47: "I am comfortable setting rough plans and adjusting as we go.",
    q48: "Before starting something, I first set the order and plan.",
    q49: "When starting something, I prefer to adjust while doing it.",
    q50: "Even if the deadline is far away, I feel better finishing early.",
    q51: "I focus better when the deadline gets close.",
    q52: "I tend to write tasks down and check them off as I go.",
    q53: "Even with a to-do list, it changes often, so I do not lock it in too much.",
    q54: "Decisions should be made quickly so work can move forward.",
    q55: "I feel more comfortable delaying decisions as much as possible.",
    q56: "I cannot focus well unless my environment is organized.",
    q57: "I do not mind much even if things are a bit messy.",
    q58: "Sudden plan changes stress me out.",
    q59: "Even if plans change, we can adjust in the moment.",
    q60: "I only feel at ease when work is fully finished.",
  },
  ja: {
    q01: "集まりに行くと、自分から先に会話を始めることが多い。",
    q02: "集まりでは、自然と聞き役になることが多い。",
    q03: "考えがまとまっていなくても、話しながら整理できる。",
    q04: "話す前に、頭の中で整理してから話す。",
    q05: "新しい人に会うとき、緊張より期待の方が大きい。",
    q06: "初対面の人と長く一緒にいると、エネルギーが早く減る。",
    q07: "グループチャットや集まりでは、自分から提案する方だ。",
    q08: "グループチャットや集まりでは、発言するまでに時間がかかる。",
    q09: "週末ずっと家にいると、かえって息苦しくなる。",
    q10: "週末は人に会うより、一人で休む方が心地いい。",
    q11: "大人数でにぎやかな雰囲気でも苦にならない。",
    q12: "静かに少人数で話す場の方がずっと楽だ。",
    q13: "初対面の相手にも、質問を気軽にできる方だ。",
    q14: "初対面の相手に話しかけるのは負担に感じる。",
    q15: "急な誘いが来たら、まず「とりあえず行こう」と思う。",
    q16: "会話では「結局どういう意味か」がより重要だと感じる。",
    q17: "会話では「正確に何があったか」がより重要だと感じる。",
    q18: "説明を聞くときは、まず全体の方向性をつかむ方が楽だ。",
    q19: "説明を聞くとき、例や具体例がないと実感しにくい。",
    q20: "一つの話を聞くと、関連する別の発想が次々浮かぶ。",
    q21: "新しいアイデアを聞くと、まず現実的に可能かを考える。",
    q22: "話を聞くとき、言葉の裏にある意図を考える方だ。",
    q23: "話を聞くとき、言葉どおりに受け取る方だ。",
    q24: "ルールがあると、まず「なぜこう作られたのか」が気になる。",
    q25: "ルールがあると、まず「どうやればよいか」が気になる。",
    q26: "会話が少し曖昧でも、流れが分かれば問題ない。",
    q27: "会話が曖昧だと、具体的に確認したくなる。",
    q28: "正解があっても、もっと良いやり方を考えてしまう。",
    q29: "検証されたやり方に従う方が安心できる。",
    q30: "「もし〜なら」のような仮定の話が面白い。",
    q31: "意思決定では、まず「どちらが正しいか」を考える。",
    q32: "意思決定では、まず「誰が傷つくか」を考える。",
    q33: "フィードバックは、言いやすさより正確さが大事だ。",
    q34: "フィードバックは、内容より口調や表現が大事なことが多い。",
    q35: "議論では、感情より結論を先に出す方だ。",
    q36: "議論では、結論より雰囲気や関係を先に考える方だ。",
    q37: "親しい相手でも、非効率だと感じたらすぐ指摘する方だ。",
    q38: "親しい相手ほど、遠回しに伝えることが多い。",
    q39: "説明を聞くと、まず論理的に妥当かを確認する。",
    q40: "説明を聞くと、まず相手の気持ちを感じ取る。",
    q41: "急ぎのときは、少し気分を害しても決断する方だ。",
    q42: "急ぎでも、人の気持ちが崩れる方が結果的に損だと感じる。",
    q43: "問題が起きたときは、まず原因を探す。",
    q44: "問題が起きたときは、まず人の状態を気にかける。",
    q45: "判断では、個人的事情より公平な基準が重要だ。",
    q46: "予定は日付と時間が確定している方が安心できる。",
    q47: "予定はざっくり決めて、状況に合わせて調整する方が楽だ。",
    q48: "何かを始めるときは、まず順序や計画を立てる。",
    q49: "何かを始めるときは、まずやってみながら合わせる。",
    q50: "締切が遠くても、先に終わらせる方が安心する。",
    q51: "締切が近づくほど集中しやすい。",
    q52: "やることは書き出して、チェックしながら進める方だ。",
    q53: "やることリストがあってもよく変わるので、強く固定しない。",
    q54: "決定は早く下した方が、物事が前に進む。",
    q55: "決定はできるだけ遅らせる方が気が楽だ。",
    q56: "環境が整っていないと集中しにくい。",
    q57: "少し散らかっていても、あまり気にならない。",
    q58: "計画が急に変わるとストレスを感じる。",
    q59: "計画が変わっても、その場で合わせればいいと思う。",
    q60: "作業は最後まで完了してこそ安心できる。",
  },
};

function normalizeLocale(locale?: string): Locale {
  if (locale === "en" || locale === "ja") return locale;
  return "ko";
}

function traitColor(k: string) {
  return TRAIT_COLOR[k] ?? "#1E88E5";
}

function roundToTens(value: number) {
  return Math.max(0, Math.min(100, Math.round(value / 10) * 10));
}

export default function MbtiTestClient({ locale }: Props) {
  const total = QUESTIONS.length;
  const activeLocale = normalizeLocale(locale);
  const ui = UI_TEXT[activeLocale];
  const base = activeLocale === "ko" ? "" : `/${activeLocale}`;

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<MbtiTestResult | null>(null);
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [isCapturing, setIsCapturing] = useState(false);

  const [tap, setTap] = useState<number | null>(null);

  const answersRef = useRef<Answers>({});
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const shareTimerRef = useRef<number | null>(null);
  const resultCaptureRef = useRef<HTMLDivElement | null>(null);

  const q = QUESTIONS[step];

  const router = useRouter();
  const sp = useSearchParams();

  const from = (sp.get("from") ?? "basic") as "basic" | "create" | "join";
  const groupId = sp.get("groupId") ?? "";
  const returnTo = sp.get("returnTo");
  const isFromForm = from === "create" || from === "join";

  const progressPct = useMemo(() => {
    return Math.round(((step + 1) / total) * 100);
  }, [step, total]);

  function queryFromResult(type: string, axes: MbtiTestResult["axes"]) {
    const qs = new URLSearchParams({
      mbti: type,
      ePercent: String(axes.E),
      nPercent: String(axes.N),
      tPercent: String(axes.T),
      jPercent: String(axes.J),
    });
    return qs.toString();
  }

  function goBackWithMbti(type: string, axes: MbtiTestResult["axes"]) {
    const mbtiQ = queryFromResult(type, axes);

    if (returnTo) {
      const sep = returnTo.includes("?") ? "&" : "?";
      router.push(`${returnTo}${sep}${mbtiQ}`);
      return;
    }

    if (groupId) {
      router.push(`${base}/mbti/g/${encodeURIComponent(groupId)}/join?${mbtiQ}`);
      return;
    }

    router.push(`${base}/mbti/create?${mbtiQ}`);
  }

  function resetAll() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    lockRef.current = false;
    setTap(null);
    setDone(false);
    setResult(null);
    setShareStatus("idle");
    setStep(0);
    answersRef.current = {};
  }

  function setCopiedFeedback() {
    if (shareTimerRef.current) window.clearTimeout(shareTimerRef.current);
    setShareStatus("copied");
    shareTimerRef.current = window.setTimeout(() => {
      setShareStatus("idle");
    }, 1800);
  }

  function saveImageFromBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.setTimeout(() => URL.revokeObjectURL(url), 3000);
  }

  async function copyTextFallback(text: string) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "true");
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }

  async function waitForCaptureAssets(root: HTMLElement) {
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(
      imgs.map(async (img) => {
        if (!img.complete || img.naturalWidth === 0) {
          await new Promise<void>((resolve) => {
            const done = () => resolve();
            img.addEventListener("load", done, { once: true });
            img.addEventListener("error", done, { once: true });
          });
        }

        if (typeof img.decode === "function") {
          try {
            await img.decode();
          } catch {
            // Ignore decode failures and proceed with best-effort capture.
          }
        }
      })
    );
  }

  function captureSize(root: HTMLElement) {
    return {
      width: Math.max(1, Math.ceil(root.scrollWidth)),
      height: Math.max(1, Math.ceil(root.scrollHeight)),
    };
  }

  function capturePixelRatio(size: { width: number; height: number }) {
    const preferred = 2.2;
    const bySide = Math.min(4096 / size.width, 4096 / size.height);
    const byArea = Math.sqrt(14_000_000 / (size.width * size.height));
    return Math.max(1, Math.min(preferred, bySide, byArea));
  }

  async function shareResult(type: string) {
    if (typeof window === "undefined") return;
    if (!resultCaptureRef.current) return;

    const shareUrl = `${window.location.origin}${base}/mbti-test`;
    const title = `${ui.resultTitle}: ${type}`;
    const text = shareUrl;

    try {
      setIsCapturing(true);
      await new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      });
      await waitForCaptureAssets(resultCaptureRef.current);
      const size = captureSize(resultCaptureRef.current);
      const pixelRatio = capturePixelRatio(size);

      const { toBlob } = await import("html-to-image");
      const blob = await toBlob(resultCaptureRef.current, {
        width: size.width,
        height: size.height,
        pixelRatio,
        cacheBust: true,
        backgroundColor: "#ffffff",
      });

      setIsCapturing(false);
      if (!blob) throw new Error("capture_failed");

      const file = new File([blob], `mbti-result-${type}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
        return;
      }

      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }

      saveImageFromBlob(blob, `mbti-result-${type}.png`);
      setCopiedFeedback();
    } catch (error) {
      setIsCapturing(false);
      if (error instanceof DOMException && error.name === "AbortError") return;
      try {
        await copyTextFallback(`${title}\n${text}`);
        setCopiedFeedback();
      } catch {
        // Ignore share/copy errors in unsupported environments.
      }
    }
  }

  function finish(nextAnswers: Answers) {
    const r = scoreMbti(nextAnswers);
    setResult(r);
    setDone(true);
  }

  function pick(v: number) {
    if (!q) return;
    if (lockRef.current) return;

    lockRef.current = true;
    setTap(v);

    const next: Answers = { ...answersRef.current, [q.id]: v };
    answersRef.current = next;

    const isLast = step === total - 1;

    timerRef.current = window.setTimeout(() => {
      setTap(null);
      lockRef.current = false;

      if (isLast) {
        finish(next);
      } else {
        setStep((s) => s + 1);
      }
    }, 120);
  }

  if (done && result) {
    const { type, axes, axisConfidence } = result;
    const displayAxes = {
      E: roundToTens(axes.E),
      N: roundToTens(axes.N),
      T: roundToTens(axes.T),
      J: roundToTens(axes.J),
    };
    const roundedAxes = {
      E: displayAxes.E,
      I: 100 - displayAxes.E,
      N: displayAxes.N,
      S: 100 - displayAxes.N,
      T: displayAxes.T,
      F: 100 - displayAxes.T,
      J: displayAxes.J,
      P: 100 - displayAxes.J,
    };
    const animal = animalMetaOf(type);

    return (
      <div
        ref={resultCaptureRef}
        className={["relative rounded-3xl bg-white", isCapturing ? "p-5" : "p-1"].join(" ")}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold text-slate-500">{ui.resultTitle}</div>
            <div className="mt-1 flex items-end gap-1">
              {type.split("").map((ch, i) => (
                <span
                  key={i}
                  className="text-4xl font-black tracking-tight"
                  style={{ color: traitColor(ch) }}
                >
                  {ch}
                </span>
              ))}
            </div>
          </div>

          {!isCapturing ? (
            <button
              type="button"
              onClick={() => shareResult(type)}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-black/10 hover:bg-slate-50"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
              >
                <path d="M12 3v12" />
                <path d="M8 7l4-4 4 4" />
                <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
              </svg>
              {shareStatus === "copied" ? ui.shareImageSaved : ui.shareResult}
            </button>
          ) : null}
        </div>

        {animal ? (
          <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/80 p-3 ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <img
                key={`${type}-animal`}
                src={animal.imageSrc}
                alt={`${type} ${animal.name[activeLocale]}`}
                width={64}
                height={64}
                loading="eager"
                decoding="sync"
                className="h-16 w-16 shrink-0 rounded-xl border border-slate-200/80 bg-white object-cover"
              />
              <div className="min-w-0">
                <div className="text-sm font-black text-slate-900">
                  {animal.emoji} {type} · {animal.name[activeLocale]}
                </div>
                <div className="mt-1 text-[12px] leading-relaxed text-slate-600">{animal.reason[activeLocale]}</div>
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-2">
          <AxisRow left="E" right="I" leftPct={roundedAxes.E} rightPct={roundedAxes.I} conf={axisConfidence.EI} locale={activeLocale} accuracyLabel={ui.accuracy} captureMode={isCapturing} />
          <AxisRow left="N" right="S" leftPct={roundedAxes.N} rightPct={roundedAxes.S} conf={axisConfidence.NS} locale={activeLocale} accuracyLabel={ui.accuracy} captureMode={isCapturing} />
          <AxisRow left="T" right="F" leftPct={roundedAxes.T} rightPct={roundedAxes.F} conf={axisConfidence.TF} locale={activeLocale} accuracyLabel={ui.accuracy} captureMode={isCapturing} />
          <AxisRow left="J" right="P" leftPct={roundedAxes.J} rightPct={roundedAxes.P} conf={axisConfidence.JP} locale={activeLocale} accuracyLabel={ui.accuracy} captureMode={isCapturing} />
        </div>

        {!isCapturing ? (
          <div className="mt-6 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={resetAll}
              className="rounded-full px-4 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-black/10 hover:bg-slate-50"
            >
              {ui.retry}
            </button>

            {isFromForm ? (
              <button
                type="button"
                onClick={() => goBackWithMbti(type, roundedAxes)}
                className="
                  mbti-primary-btn rounded-full px-5 py-2 text-xs font-extrabold text-white
                  transition-all duration-200 active:scale-[0.97]
                "
              >
                {ui.useResult}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push(`${base}/mbti/create?${queryFromResult(type, roundedAxes)}`)}
                className="
                  mbti-primary-btn rounded-full px-5 py-2 text-xs font-extrabold text-white
                  transition-all duration-200 active:scale-[0.97]
                "
              >
                {ui.createWithResult}
              </button>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="text-[11px] font-black tracking-tight text-slate-500">
          {step + 1} / {total}
        </div>

        <button
          type="button"
          onClick={resetAll}
          className="
            rounded-full px-3 py-1.5
            text-[11px] font-black text-slate-700
            bg-white/70 ring-1 ring-black/10 shadow-sm
            transition hover:bg-white active:scale-[0.98]
          "
        >
          {ui.reset}
        </button>
      </div>

      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 ring-1 ring-black/5">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#1E88E5] to-[#3ba6ff] transition-[width] duration-300"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      <div className="mt-6 min-h-[76px] text-[15px] font-black leading-6 text-slate-900 tracking-tight">
        {q ? QUESTION_TEXT[activeLocale][q.id] ?? q.text : ""}
      </div>

      <div className="mt-4 grid gap-2">
        {ui.scale.map((s) => (
          <button
            key={s.v}
            type="button"
            onClick={() => pick(s.v)}
            className={[
              "group flex items-center justify-between rounded-2xl px-4 py-3 text-left",
              "bg-white/70 ring-1 ring-black/10 shadow-sm",
              "transition-all duration-150 will-change-transform",
              "hover:bg-white hover:ring-black/15",
              "active:scale-[0.985] active:translate-y-[1px]",
              tap === s.v
                ? "bg-[#DBECFF] ring-2 ring-[#1E88E5] shadow-[0_0_0_3px_rgba(30,136,229,0.22)] scale-[0.985] -translate-y-[1px]"
                : "",
            ].join(" ")}
          >
            <span className={["text-sm font-black", tap === s.v ? "text-[#0E5EA8]" : "text-slate-800"].join(" ")}>
              {s.label}
            </span>
            <span
              className={[
                "tabular-nums text-[11px] font-black transition-colors",
                tap === s.v ? "text-[#0E5EA8]" : "text-slate-400",
              ].join(" ")}
            >
              {s.v}
            </span>
          </button>
        ))}
      </div>

      <div className="mt-3 text-[11px] font-bold text-slate-500">{ui.autoNextHint}</div>
    </div>
  );
}

function AxisRow({
  left,
  right,
  leftPct,
  rightPct,
  conf,
  locale,
  accuracyLabel,
  captureMode = false,
}: {
  left: string;
  right: string;
  leftPct: number;
  rightPct: number;
  conf: number;
  locale: Locale;
  accuracyLabel: string;
  captureMode?: boolean;
}) {
  const delta = leftPct - 50;
  const leanLeft = delta >= 0;
  const diff = Math.round(Math.abs(delta));
  const halfFill = Math.min(100, diff * 2);

  const winner = leftPct >= rightPct ? left : right;
  const isLeftWin = winner === left;
  const isRightWin = winner === right;
  const color = traitColor(winner);

  const leftFill = leanLeft ? halfFill : 0;
  const rightFill = leanLeft ? 0 : halfFill;

  return (
    <div className={["mbti-card-soft rounded-3xl p-4 ring-1 ring-black/10", captureMode ? "shadow-none" : ""].join(" ")}>
      <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
        <div className="min-w-0 text-left">
          <div className="inline-flex items-end gap-1.5">
            <span
              className={[
                "leading-none transition-all",
                isLeftWin ? "text-[22px] font-black" : "text-[16px] font-black opacity-40",
              ].join(" ")}
              style={{ color: traitColor(left) }}
            >
              {left}
            </span>
            <span
              className={[
                "tabular-nums text-[12px] font-black",
                isLeftWin ? "text-slate-900" : "text-slate-400",
              ].join(" ")}
            >
              {leftPct}%
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <span className="inline-flex min-w-[106px] items-center justify-center rounded-full bg-slate-900/5 px-3 py-1 text-center text-[11px] font-black text-slate-700 ring-1 ring-black/5 tabular-nums whitespace-nowrap">
            {accuracyLabel} {conf}%
          </span>
        </div>

        <div className="min-w-0 text-right">
          <div className="inline-flex items-end justify-end gap-1.5">
            <span
              className={[
                "tabular-nums text-[12px] font-black",
                isRightWin ? "text-slate-900" : "text-slate-400",
              ].join(" ")}
            >
              {rightPct}%
            </span>
            <span
              className={[
                "leading-none transition-all",
                isRightWin ? "text-[22px] font-black" : "text-[16px] font-black opacity-40",
              ].join(" ")}
              style={{ color: traitColor(right) }}
            >
              {right}
            </span>
          </div>
        </div>
      </div>

      <div className="relative mt-3 h-3.5 w-full overflow-hidden rounded-full bg-slate-200/80 ring-1 ring-black/5">
        <div className="absolute inset-0 flex">
          <div className="relative h-full w-1/2 overflow-hidden">
            <div
              className="absolute right-0 top-0 h-full rounded-l-full transition-[width] duration-300"
              style={{ width: `${leftFill}%`, backgroundColor: color }}
            />
          </div>

          <div className="relative h-full w-1/2 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-r-full transition-[width] duration-300"
              style={{ width: `${rightFill}%`, backgroundColor: color }}
            />
          </div>
        </div>

        <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-slate-400/70" />
      </div>

      <div className="mt-2 text-[11px] font-semibold text-slate-600">{TRAIT_ONE_LINER[locale][winner]}</div>
    </div>
  );
}
