"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { QUESTIONS_8 as QUESTIONS } from "@/lib/mbtiTest/questions8";
import { scoreMbti, type Answers, type MbtiTestResult } from "@/lib/mbtiTest/score8";
import { animalMetaOf } from "@/lib/mbti/animalMeta";

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
    const { type, axes } = result;
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
          <div
            className={[
              "mt-4 rounded-2xl p-3",
              isCapturing ? "border border-slate-300 bg-white" : "border border-slate-200/80 bg-white/80 ring-1 ring-black/5",
            ].join(" ")}
          >
            <div className="flex items-center gap-3">
              {/* html-to-image 캡처 호환을 위해 일반 img를 유지 */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
          <AxisRow left="E" right="I" leftPct={axes.E} rightPct={axes.I} locale={activeLocale} captureMode={isCapturing} />
          <AxisRow left="N" right="S" leftPct={axes.N} rightPct={axes.S} locale={activeLocale} captureMode={isCapturing} />
          <AxisRow left="T" right="F" leftPct={axes.T} rightPct={axes.F} locale={activeLocale} captureMode={isCapturing} />
          <AxisRow left="J" right="P" leftPct={axes.J} rightPct={axes.P} locale={activeLocale} captureMode={isCapturing} />
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
  locale,
  captureMode = false,
}: {
  left: string;
  right: string;
  leftPct: number;
  rightPct: number;
  locale: Locale;
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
    <div
      className="mbti-card-soft rounded-3xl p-4 ring-1 ring-black/10"
      style={captureMode ? { boxShadow: "none", backgroundColor: "#ffffff" } : undefined}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-center gap-2">
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
