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

const TRAIT_COLOR: Record<string, string> = {
    E: "#FF6B6B", // coral
    I: "#4D96FF", // blue
    N: "#9B59B6", // purple
    S: "#2ECC71", // green
    T: "#F39C12", // orange
    F: "#E84393", // pink
    J: "#2D3436", // dark
    P: "#16A085", // teal
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
              <div className="min-h-[72px] text-base font-extrabold leading-6 text-slate-900">
                {q.text}
                </div>

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
      <div className="mt-1 flex items-end gap-1">
        {type.split("").map((ch, i) => (
            <span
            key={i}
            className="text-3xl font-black tracking-tight"
            style={{ color: traitColor(ch) }}
            >
            {ch}
            </span>
        ))}
        </div>

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
  const delta = leftPct - 50;                // -50..+50
  const leanLeft = delta >= 0;               // true면 left쪽 우세
  const diff = Math.round(Math.abs(delta));  // 0..50
  const halfFill = Math.min(100, diff * 2);  // 0..100 (반쪽 기준 채움)

  const winner = leanLeft ? left : right;
  const color = traitColor(winner);

  const leftFill = leanLeft ? halfFill : 0;
  const rightFill = leanLeft ? 0 : halfFill;

  return (
    <div className="rounded-2xl bg-white/70 p-3 ring-1 ring-black/10">
      {/* ✅ 상단: 좌/중/우 고정폭 그리드 */}
        <div className="grid grid-cols-[84px_1fr_84px] items-center text-xs font-extrabold text-slate-700">
        {/* left */}
        <div className="text-left">
            <span style={{ color: traitColor(left) }} className="inline-flex items-baseline gap-1">
            <span className="font-black">{left}</span>
            <span className="tabular-nums text-slate-900">{leftPct}%</span>
            </span>
        </div>

        {/* center (항상 중앙 고정) */}
        <div className="text-center">
            <span className="inline-flex items-center justify-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-900 ring-1 ring-black/5 tabular-nums">
            축명확도 {conf}%
            </span>
        </div>

        {/* right */}
        <div className="text-right">
            <span style={{ color: traitColor(right) }} className="inline-flex items-baseline gap-1">
            <span className="tabular-nums text-slate-900">{rightPct}%</span>
            <span className="font-black">{right}</span>
            </span>
        </div>
        </div>

      {/* ✅ 중앙 기준 바 (좌/우 50% 분리, overflow로 뚫림 방지) */}
      <div className="relative mt-2 h-3 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="absolute inset-0 flex">
          {/* left half */}
          <div className="relative h-3 w-1/2 overflow-hidden">
            <div
              className="absolute right-0 top-0 h-3 rounded-l-full"
              style={{ width: `${leftFill}%`, backgroundColor: color }}
            />
          </div>
          {/* right half */}
          <div className="relative h-3 w-1/2 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-3 rounded-r-full"
              style={{ width: `${rightFill}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {/* 중앙 라인 */}
        <div className="absolute left-1/2 top-0 h-3 w-[2px] -translate-x-1/2 rounded-full bg-slate-400/70" />
      </div>
    </div>
  );
}



