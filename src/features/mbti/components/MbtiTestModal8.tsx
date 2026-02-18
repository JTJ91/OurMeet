// components/MbtiTestModal.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS_8 as QUESTIONS } from "@/lib/mbtiTest/questions8";
import { scoreMbti, type Answers, type MbtiTestResult } from "@/lib/mbtiTest/score8";
import Link from "next/link";

type Locale = "ko" | "en" | "ja";

const UI_TEXT: Record<
  Locale,
  {
    yes: string;
    no: string;
    title: string;
    close: string;
    result: string;
    detailLead: string;
    detailLink: string;
    detailTail: string;
    applyResult: string;
  }
> = {
  ko: {
    yes: "그렇다",
    no: "아니다",
    title: "MBTI 간단 검사",
    close: "닫기",
    result: "결과",
    detailLead: "더 자세한 결과를 원하시면 ",
    detailLink: "MBTI 상세검사",
    detailTail: "에서 확인할 수 있습니다.",
    applyResult: "이 결과로 입력하기",
  },
  en: {
    yes: "Yes",
    no: "No",
    title: "Quick MBTI Test",
    close: "Close",
    result: "Result",
    detailLead: "If you want a more detailed result, check ",
    detailLink: "MBTI Full Test",
    detailTail: ".",
    applyResult: "Use this result",
  },
  ja: {
    yes: "はい",
    no: "いいえ",
    title: "MBTI簡単テスト",
    close: "閉じる",
    result: "結果",
    detailLead: "より詳しい結果は",
    detailLink: "MBTI正式テスト",
    detailTail: "で確認できます。",
    applyResult: "この結果を入力",
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

function traitColor(k: string) {
  return TRAIT_COLOR[k] ?? "#1E88E5";
}

export default function MbtiTestModal({
  open,
  onClose,
  onComplete,
  context = "basic",
  groupId,
  returnTo,
  locale,
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (r: MbtiTestResult) => void;
  // ✅ 추가
  context?: "basic" | "create" | "join";
  groupId?: string;
  returnTo?: string; // join 페이지로 복귀용(선택)
  locale?: string;
}) {
  const total = QUESTIONS.length;
  const activeLocale = normalizeLocale(locale);
  const ui = UI_TEXT[activeLocale];
  const choices = useMemo(
    () => [
      { v: true, label: ui.yes },
      { v: false, label: ui.no },
    ],
    [ui.no, ui.yes]
  );

  const [tap, setTap] = useState<boolean | null>(null);
  const [locked, setLocked] = useState(false);

  // ✅ 즉시 잠금 (연타/터치 중복 방지)
  const lockRef = useRef(false);

  const [step, setStep] = useState(0); // 0..7
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<MbtiTestResult | null>(null);

  // ✅ 최신 answers/step을 안전하게 읽기 위한 ref
  const answersRef = useRef<Answers>({});
  const stepRef = useRef(0);

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  useEffect(() => {
    stepRef.current = step;
  }, [step]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!open) {
      lockRef.current = false;
      setStep(0);
      stepRef.current = 0;

      setAnswers({});
      answersRef.current = {};

      setDone(false);
      setResult(null);
      setTap(null);
      setLocked(false);
    }
  }, [open]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const q = QUESTIONS[step];

  const progressPct = useMemo(() => {
    return Math.round(((step + 1) / total) * 100);
  }, [step, total]);

  const detailHref = useMemo(() => {
    const qp = new URLSearchParams();

    if (context === "create") qp.set("from", "create");
    else if (context === "join") {
      qp.set("from", "join");
      if (groupId) qp.set("groupId", groupId);
      if (returnTo) qp.set("returnTo", returnTo);
    } else {
      qp.set("from", "basic");
    }

    const qs = qp.toString();
    const base = activeLocale === "ko" ? "" : `/${activeLocale}`;
    return `${base}/mbti-test${qs ? `?${qs}` : ""}`;
  }, [activeLocale, context, groupId, returnTo]);

  if (!open) return null;

  function finish(nextAnswers: Answers) {
    const r = scoreMbti(nextAnswers);
    setResult(r);
    setDone(true);
  }

  function setPickAndAdvance(v: boolean) {
    const currentStep = stepRef.current;
    const currentQ = QUESTIONS[currentStep];
    if (!currentQ) return;

    if (lockRef.current) return;
    lockRef.current = true;

    setLocked(true);
    setTap(v);

    const next: Answers = { ...answersRef.current, [currentQ.id]: v };
    answersRef.current = next;
    setAnswers(next);

    const isLast = currentStep === total - 1;

    window.setTimeout(() => {
      setTap(null);
      setLocked(false);
      lockRef.current = false;

      if (isLast) {
        finish(next);
      } else {
        setStep(Math.min(total - 1, currentStep + 1));
      }
    }, 140);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-[520px] rounded-3xl bg-white shadow-xl ring-1 ring-black/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div className="text-sm font-extrabold text-slate-900">{ui.title}</div>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            {ui.close}
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>{done ? ui.result : `${step + 1} / ${total}`}</span>
            <span>{done ? "" : `${progressPct}%`}</span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
            <div className="h-2 rounded-full bg-[#1E88E5]" style={{ width: `${done ? 100 : progressPct}%` }} />
          </div>
        </div>

        {/* Body */}
        <div className="px-5 pb-4 pt-5">
          {!done ? (
            <>
              <div className="min-h-[72px] text-base font-extrabold leading-6 text-slate-900">
                {q ? QUESTION_TEXT[activeLocale][q.id] ?? q.text : ""}
              </div>

              <div className="mt-4 grid gap-2">
                {choices.map((c) => (
                  <button
                    key={String(c.v)}
                    type="button"
                    disabled={locked}
                    onClick={() => setPickAndAdvance(c.v)}
                    className={[
                      "flex items-center justify-between rounded-2xl px-4 py-3 text-left ring-1",
                      "bg-white text-slate-800 ring-black/10 hover:bg-slate-50",
                      "transition-all duration-150",
                      "active:scale-[0.98] active:ring-black/20",
                      tap === c.v ? "scale-[0.99] bg-[#E9F2FF] ring-[#1E88E5]/30" : "",
                      locked ? "opacity-80" : "",
                    ].join(" ")}
                  >
                    <span className="text-sm font-extrabold">{c.label}</span>
                    <span className={["text-xs font-black", c.v ? "text-[#1E88E5]" : "text-slate-500"].join(" ")}>
                      {c.v ? "✓" : "✕"}
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-3 text-[11px] font-bold text-slate-500">
                {ui.detailLead}
                <Link
                  href={detailHref}
                  className="underline underline-offset-2 hover:text-slate-700"
                >
                  {ui.detailLink}
                </Link>
                {ui.detailTail}
              </div>

            </>
          ) : (
            result && (
              <ResultView
                result={result}
                onUse={() => onComplete(result)}
                resultLabel={ui.result}
                applyResultLabel={ui.applyResult}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}

function ResultView({
  result,
  onUse,
  resultLabel,
  applyResultLabel,
}: {
  result: MbtiTestResult;
  onUse: () => void;
  resultLabel: string;
  applyResultLabel: string;
}) {
  const { type } = result;

  return (
    <div>
      <div className="text-sm font-extrabold text-slate-500">{resultLabel}</div>

      <div className="mt-1 flex items-end gap-1">
        {type.split("").map((ch, i) => (
          <span key={i} className="text-3xl font-black tracking-tight" style={{ color: traitColor(ch) }}>
            {ch}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onUse}
          className="rounded-full bg-[#1E88E5] px-5 py-2 text-xs font-extrabold text-white"
        >
          {applyResultLabel}
        </button>
      </div>
    </div>
  );
}
