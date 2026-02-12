// components/MbtiTestModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { QUESTIONS } from "@/app/lib/mbtiTest/questions";
import { scoreMbti, type Answers, type MbtiTestResult } from "@/app/lib/mbtiTest/score";

const SCALE = [
  { v: 1, label: "전혀 아니다" },
  { v: 2, label: "아니다" },
  { v: 3, label: "보통" },
  { v: 4, label: "그렇다" },
  { v: 5, label: "매우 그렇다" },
];

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
  const [tap, setTap] = useState<number | null>(null); // ✅ 추가: 방금 누른 값
  const [locked, setLocked] = useState(false);

  const [step, setStep] = useState(0); // 0..59
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<MbtiTestResult | null>(null);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setAnswers({});
      setDone(false);
      setResult(null);
    }
  }, [open]);

  const q = QUESTIONS[step];

  const progressPct = useMemo(() => {
    return Math.round(((step + 1) / total) * 100);
  }, [step, total]);

  if (!open) return null;

  const isLast = step === total - 1;

  function finish(nextAnswers: Answers) {
    const r = scoreMbti(nextAnswers);
    setResult(r);
    setDone(true);
  }

  function setPickAndAdvance(v: number) {
    if (!q) return;

    // ✅ 연타 방지
    if (locked) return;
    setLocked(true);

    setTap(v);

    setAnswers((prev) => {
        const next = { ...prev, [q.id]: v };

        setTimeout(() => {
        setTap(null);
        setLocked(false); // ✅ 여기서 다시 풀어줌

        if (isLast) {
            finish(next);
        } else {
            setStep((s) => Math.min(total - 1, s + 1));
        }
        }, 140);

        return next;
    });
    }



  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 p-3">
      <div className="w-full max-w-[520px] rounded-3xl bg-white shadow-xl ring-1 ring-black/10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black/5 px-5 py-4">
          <div className="text-sm font-extrabold text-slate-900">MBTI 검사</div>
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
              <div className="text-base font-extrabold leading-6 text-slate-900">{q.text}</div>

              <div className="mt-4 grid gap-2">
                {SCALE.map((s) => (
                  <button
                    key={s.v}
                    type="button"
                    disabled={locked}   // ✅ 여기 추가
                    onClick={() => setPickAndAdvance(s.v)} // ✅ 누르면 바로 다음으로
                    className={[
                    "flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold ring-1",
                    "bg-white text-slate-700 ring-black/10 hover:bg-slate-50",
                    "transition-all duration-150",                 // ✅ transform + bg + ring 같이 부드럽게
                    "active:scale-[0.98] active:ring-black/20",    // ✅ 마우스 클릭 순간
                    tap === s.v ? "scale-[0.99] bg-[#E9F2FF] ring-[#1E88E5]/30" : "", // ✅ 140~180ms 유지
                    locked ? "opacity-80" : "",
                    ].join(" ")}
                  >
                    <span>{s.label}</span>
                    <span className="text-xs font-extrabold text-slate-500">{s.v}</span>
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
  const { type, axes, confidence, weakAxes, axisConfidence, penalties } = result;

  const weakText =
    weakAxes.length === 0
      ? "꽤 명확하게 나왔습니다."
      : `애매한 축: ${weakAxes.join(", ")} (다시 해보면 바뀔 수 있어요)`;

  const penaltyHint = (() => {
    const msgs: string[] = [];
    if (penalties?.neutral >= 8) msgs.push("‘보통’(3) 선택이 많아 축 구분이 흐릴 수 있어요.");
    if (penalties?.consistency >= 8) msgs.push("몇 문항에서 답이 서로 충돌해 신뢰도가 낮아질 수 있어요.");
    return msgs.length ? msgs.join(" ") : "";
  })();

  return (
    <div>
      <div className="text-sm font-extrabold text-slate-500">결과</div>
      <div className="mt-1 text-3xl font-black tracking-tight text-slate-900">{type}</div>

      <div className="mt-3 rounded-2xl bg-white/70 p-4 ring-1 ring-black/10">
        <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
          <span>신뢰도</span>
          <span className="text-slate-900">{confidence}%</span>
        </div>
        <div className="mt-2 text-[11px] font-bold text-slate-500">
          {weakText}
          {penaltyHint ? ` ${penaltyHint}` : ""}
        </div>
      </div>

      <div className="mt-4 grid gap-2">
        <AxisRow left="E" right="I" leftPct={axes.E} rightPct={axes.I} conf={axisConfidence.EI} />
        <AxisRow left="N" right="S" leftPct={axes.N} rightPct={axes.S} conf={axisConfidence.NS} />
        <AxisRow left="T" right="F" leftPct={axes.T} rightPct={axes.F} conf={axisConfidence.TF} />
        <AxisRow left="J" right="P" leftPct={axes.J} rightPct={axes.P} conf={axisConfidence.JP} />
      </div>

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={onClose}
          className="rounded-full px-4 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-black/10"
        >
          닫기
        </button>
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

function AxisRow({
  left,
  right,
  leftPct,
  rightPct,
  conf,
}: {
  left: string;
  right: string;
  leftPct: number;
  rightPct: number;
  conf: number;
}) {
  const majorLeft = leftPct >= rightPct;
  return (
    <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/10">
      <div className="flex items-center justify-between text-xs font-extrabold text-slate-700">
        <span>
          {left} {leftPct}% · {right} {rightPct}%
        </span>
        <span className="text-[11px] font-black text-slate-900">축명확도 {conf}%</span>
      </div>

      <div className="mt-2 h-2 w-full rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-[#1E88E5]" style={{ width: `${majorLeft ? leftPct : rightPct}%` }} />
      </div>
    </div>
  );
}
