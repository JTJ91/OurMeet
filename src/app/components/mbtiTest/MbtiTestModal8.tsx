// components/MbtiTestModal.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS_8 as QUESTIONS } from "@/app/lib/mbtiTest/questions8";
import { scoreMbti, type Answers, type MbtiTestResult } from "@/app/lib/mbtiTest/score8";

const CHOICES = [
  { v: true, label: "그렇다" },
  { v: false, label: "아니다" },
];

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
}: {
  open: boolean;
  onClose: () => void;
  onComplete: (r: MbtiTestResult) => void;
}) {
  const total = QUESTIONS.length;

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

  const q = QUESTIONS[step];

  const progressPct = useMemo(() => {
    return Math.round(((step + 1) / total) * 100);
  }, [step, total]);

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
          <div className="text-sm font-extrabold text-slate-900">MBTI 간단 검사</div>
          <button
            type="button"
            className="rounded-full px-3 py-1.5 text-xs font-extrabold text-slate-600 hover:bg-slate-50"
            onClick={onClose}
          >
            닫기
          </button>
        </div>

        {/* Progress */}
        <div className="px-5 pt-4">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
            <span>{done ? "결과" : `${step + 1} / ${total}`}</span>
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
                {q?.text}
              </div>

              <div className="mt-4 grid gap-2">
                {CHOICES.map((c) => (
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
                ※ 답을 누르면 다음 문항으로 자동 이동합니다.
              </div>
            </>
          ) : (
            result && <ResultView result={result} onUse={() => onComplete(result)} onClose={onClose} />
          )}
        </div>
      </div>
    </div>
  );
}

function ResultView({
  result,
  onUse,
  onClose,
}: {
  result: MbtiTestResult;
  onUse: () => void;
  onClose: () => void;
}) {
  const { type } = result;

  return (
    <div>
      <div className="text-sm font-extrabold text-slate-500">결과</div>

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
          이 결과로 입력하기
        </button>
      </div>
    </div>
  );
}
