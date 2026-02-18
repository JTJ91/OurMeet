"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { QUESTIONS_8 as QUESTIONS } from "@/lib/mbtiTest/questions8";
import { scoreMbti, type Answers, type MbtiTestResult } from "@/lib/mbtiTest/score8";

type Locale = "ko" | "en" | "ja";

type Props = {
  locale?: string;
};

type ShareStatus = "idle" | "copied";

const UI_TEXT: Record<
  Locale,
  {
    yes: string;
    no: string;
    reset: string;
    resultTitle: string;
    retry: string;
    accuracy: string;
    useResult: string;
    createWithResult: string;
    fullTestLead: string;
    fullTestLink: string;
    fullTestTail: string;
    shareResult: string;
    shareImageSaved: string;
    shareTextPrefix: string;
  }
> = {
  ko: {
    yes: "그렇다",
    no: "아니다",
    reset: "초기화",
    resultTitle: "검사 결과",
    retry: "다시하기",
    accuracy: "정확도",
    useResult: "이 검사결과 사용하기",
    createWithResult: "이 검사결과로 방 만들기",
    fullTestLead: "더 자세한 분석은 ",
    fullTestLink: "60문항 정밀 검사",
    fullTestTail: "에서 확인할 수 있어요.",
    shareResult: "결과 공유",
    shareImageSaved: "이미지 저장됨",
    shareTextPrefix: "내 MBTI 검사 결과",
  },
  en: {
    yes: "Yes",
    no: "No",
    reset: "Reset",
    resultTitle: "Test Result",
    retry: "Retake",
    accuracy: "Confidence",
    useResult: "Use this result",
    createWithResult: "Create group with this result",
    fullTestLead: "For a deeper analysis, try the ",
    fullTestLink: "60-question full test",
    fullTestTail: ".",
    shareResult: "Share Result",
    shareImageSaved: "Image saved",
    shareTextPrefix: "My MBTI test result",
  },
  ja: {
    yes: "はい",
    no: "いいえ",
    reset: "リセット",
    resultTitle: "診断結果",
    retry: "もう一度",
    accuracy: "信頼度",
    useResult: "この結果を使う",
    createWithResult: "この結果でグループ作成",
    fullTestLead: "より詳しい分析は",
    fullTestLink: "60問の精密テスト",
    fullTestTail: "で確認できます。",
    shareResult: "結果を共有",
    shareImageSaved: "画像を保存",
    shareTextPrefix: "私のMBTI診断結果",
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
    q01: "I can quickly start a comfortable conversation even with someone I just met.",
    q02: "After meeting people, I need alone time to recharge my energy.",
    q03: "Even when doing nothing, new ideas or imagination keep coming to mind.",
    q04: "Compared to vague imagination, visible and verified information feels much easier.",
    q05: "When someone says they are struggling, I tend to suggest solutions over empathy.",
    q06: "When someone says they are struggling, I tend to understand their feelings over giving solutions.",
    q07: "If a plan I made changes, I usually feel more stressed than expected.",
    q08: "Rather than planning every detail from the start, I prefer setting a rough direction and adjusting as I go.",
  },
  ja: {
    q01: "初対面の人とも、わりと早く気楽に会話を続けられる方だ。",
    q02: "人と会った後は、一人の時間がないとエネルギーが回復しにくい。",
    q03: "じっとしていても、新しいアイデアや想像が次々に浮かぶ方だ。",
    q04: "あいまいな想像より、目で見て確認できる情報のほうがずっと楽だ。",
    q05: "誰かがつらいと言うと、共感より解決策を示すほうに近い。",
    q06: "誰かがつらいと言うと、解決策より気持ちを理解するほうに近い。",
    q07: "立てた計画が崩れると、思った以上にストレスを受けやすい。",
    q08: "最初から細かく計画するより、大枠だけ決めて状況に合わせて動く方だ。",
  },
};

function normalizeLocale(locale?: string): Locale {
  if (locale === "en" || locale === "ja") return locale;
  return "ko";
}

function traitColor(k: string) {
  return TRAIT_COLOR[k] ?? "#1E88E5";
}

export default function MbtiTestQuickClient({ locale }: Props) {
  const total = QUESTIONS.length;
  const activeLocale = normalizeLocale(locale);
  const ui = UI_TEXT[activeLocale];
  const base = activeLocale === "ko" ? "" : `/${activeLocale}`;

  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<MbtiTestResult | null>(null);
  const [shareStatus, setShareStatus] = useState<ShareStatus>("idle");
  const [isCapturing, setIsCapturing] = useState(false);

  const [tap, setTap] = useState<boolean | null>(null);

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

  const fullTestHref = useMemo(() => {
    const qp = new URLSearchParams();
    if (from) qp.set("from", from);
    if (groupId) qp.set("groupId", groupId);
    if (returnTo) qp.set("returnTo", returnTo);
    const qs = qp.toString();
    return `${base}/mbti-test${qs ? `?${qs}` : ""}`;
  }, [base, from, groupId, returnTo]);

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

    const shareUrl = `${window.location.origin}${base}/mbti-test/quick`;
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

      const file = new File([blob], `mbti-quick-result-${type}.png`, { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title, text, files: [file] });
        return;
      }

      if (navigator.share) {
        await navigator.share({ title, text });
        return;
      }

      saveImageFromBlob(blob, `mbti-quick-result-${type}.png`);
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

  function pick(v: boolean) {
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
    }, 140);
  }

  if (done && result) {
    const { type, axes, axisConfidence } = result;
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
                <span key={i} className="text-4xl font-black tracking-tight" style={{ color: traitColor(ch) }}>
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
          <AxisRow left="E" right="I" leftPct={axes.E} rightPct={axes.I} conf={axisConfidence.EI} locale={activeLocale} accuracyLabel={ui.accuracy} />
          <AxisRow left="N" right="S" leftPct={axes.N} rightPct={axes.S} conf={axisConfidence.NS} locale={activeLocale} accuracyLabel={ui.accuracy} />
          <AxisRow left="T" right="F" leftPct={axes.T} rightPct={axes.F} conf={axisConfidence.TF} locale={activeLocale} accuracyLabel={ui.accuracy} />
          <AxisRow left="J" right="P" leftPct={axes.J} rightPct={axes.P} conf={axisConfidence.JP} locale={activeLocale} accuracyLabel={ui.accuracy} />
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
                onClick={() => goBackWithMbti(type, axes)}
                className="mbti-primary-btn rounded-full px-5 py-2 text-xs font-extrabold text-white transition-all duration-200 active:scale-[0.97]"
              >
                {ui.useResult}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push(`${base}/mbti/create?${queryFromResult(type, axes)}`)}
                className="mbti-primary-btn rounded-full px-5 py-2 text-xs font-extrabold text-white transition-all duration-200 active:scale-[0.97]"
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
          className="rounded-full bg-white/70 px-3 py-1.5 text-[11px] font-black text-slate-700 ring-1 ring-black/10 shadow-sm transition hover:bg-white active:scale-[0.98]"
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

      <div className="mt-6 min-h-[76px] text-[15px] font-black leading-6 tracking-tight text-slate-900">
        {q ? QUESTION_TEXT[activeLocale][q.id] ?? q.text : ""}
      </div>

      <div className="mt-4 grid gap-2">
        <button
          type="button"
          onClick={() => pick(true)}
          className={[
            "group flex items-center justify-between rounded-2xl px-4 py-3 text-left",
            "bg-white/70 ring-1 ring-black/10 shadow-sm",
            "transition-all duration-150 will-change-transform",
            "hover:bg-white hover:ring-black/15",
            "active:scale-[0.985] active:translate-y-[1px]",
            tap === true
              ? "bg-[#DBECFF] ring-2 ring-[#1E88E5] shadow-[0_0_0_3px_rgba(30,136,229,0.22)] scale-[0.985] -translate-y-[1px]"
              : "",
          ].join(" ")}
        >
          <span className={["text-sm font-black", tap === true ? "text-[#0E5EA8]" : "text-slate-800"].join(" ")}>
            {ui.yes}
          </span>
          <span className={["text-[11px] font-black transition-colors", tap === true ? "text-[#0E5EA8]" : "text-[#1E88E5]"].join(" ")}>
            Y
          </span>
        </button>

        <button
          type="button"
          onClick={() => pick(false)}
          className={[
            "group flex items-center justify-between rounded-2xl px-4 py-3 text-left",
            "bg-white/70 ring-1 ring-black/10 shadow-sm",
            "transition-all duration-150 will-change-transform",
            "hover:bg-white hover:ring-black/15",
            "active:scale-[0.985] active:translate-y-[1px]",
            tap === false
              ? "bg-[#DBECFF] ring-2 ring-[#1E88E5] shadow-[0_0_0_3px_rgba(30,136,229,0.22)] scale-[0.985] -translate-y-[1px]"
              : "",
          ].join(" ")}
        >
          <span className={["text-sm font-black", tap === false ? "text-[#0E5EA8]" : "text-slate-800"].join(" ")}>
            {ui.no}
          </span>
          <span className={["text-[11px] font-black transition-colors", tap === false ? "text-[#0E5EA8]" : "text-slate-400"].join(" ")}>
            N
          </span>
        </button>
      </div>

      <div className="mt-3 text-[11px] font-bold text-slate-500">
        {ui.fullTestLead}
        <Link href={fullTestHref} className="underline underline-offset-2 hover:text-slate-700">
          {ui.fullTestLink}
        </Link>
        {ui.fullTestTail}
      </div>
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
}: {
  left: string;
  right: string;
  leftPct: number;
  rightPct: number;
  conf: number;
  locale: Locale;
  accuracyLabel: string;
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
    <div className="mbti-card-soft rounded-3xl p-4 ring-1 ring-black/10">
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
            <span className={["tabular-nums text-[12px] font-black", isLeftWin ? "text-slate-900" : "text-slate-400"].join(" ")}>
              {leftPct}%
            </span>
          </div>
        </div>

        <div className="flex justify-center">
          <span className="inline-flex w-[96px] items-center justify-center rounded-full bg-slate-900/5 px-2.5 py-1 text-center text-[11px] font-black tabular-nums text-slate-700 ring-1 ring-black/5 whitespace-nowrap">
            {accuracyLabel} {conf}%
          </span>
        </div>

        <div className="min-w-0 text-right">
          <div className="inline-flex items-end justify-end gap-1.5">
            <span className={["tabular-nums text-[12px] font-black", isRightWin ? "text-slate-900" : "text-slate-400"].join(" ")}>
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
