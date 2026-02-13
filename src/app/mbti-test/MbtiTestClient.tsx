// app/mbti-test/MbtiTestClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { QUESTIONS } from "@/app/lib/mbtiTest/questions";
import { scoreMbti, type Answers, type MbtiTestResult } from "@/app/lib/mbtiTest/score";
import { useRouter, useSearchParams } from "next/navigation";


const SCALE = [
  { v: 1, label: "전혀 아니다" },
  { v: 2, label: "아니다" },
  { v: 3, label: "보통" },
  { v: 4, label: "그렇다" },
  { v: 5, label: "매우 그렇다" },
] as const;

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

const TRAIT_ONE_LINER: Record<string, string> = {
  E: "사람·활동 속에서 에너지를 얻는 외향 성향.",
  I: "혼자만의 시간에서 에너지를 회복하는 내향 성향.",

  N: "가능성과 아이디어를 먼저 보는 직관 성향.",
  S: "경험과 현실 정보를 중시하는 감각 성향.",

  T: "논리와 원칙을 기준으로 판단하는 사고 성향.",
  F: "사람과 감정을 기준으로 판단하는 감정 성향.",

  J: "계획을 세우고 정리하는 것을 선호하는 성향.",
  P: "유연하게 상황에 맞추는 것을 선호하는 성향.",
};

export default function MbtiTestClient() {
  const total = QUESTIONS.length;

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [done, setDone] = useState(false);
  const [result, setResult] = useState<MbtiTestResult | null>(null);

  const [tap, setTap] = useState<number | null>(null);
  const [locked, setLocked] = useState(false);

  const answersRef = useRef<Answers>({});
  const lockRef = useRef(false);
  const timerRef = useRef<number | null>(null);

  const q = QUESTIONS[step];

  const router = useRouter();

  const sp = useSearchParams();

  // from=basic|create|join (기본은 basic)
  const from = (sp.get("from") ?? "basic") as "basic" | "create" | "join";
  const groupId = sp.get("groupId") ?? "";
  const returnTo = sp.get("returnTo"); // optional

  const progressPct = useMemo(() => {
    return Math.round(((step + 1) / total) * 100);
  }, [step, total]);

  function goBackWithMbti(type: string) {
    const mbtiQ = `mbti=${encodeURIComponent(type)}`;

    // ✅ returnTo가 있으면 최우선
    if (returnTo) {
      const sep = returnTo.includes("?") ? "&" : "?";
      router.push(`${returnTo}${sep}${mbtiQ}`);
      return;
    }

    // ✅ returnTo 없으면: 너 프로젝트 join 라우트로 복귀
    if (groupId) {
      router.push(`/mbti/g/${encodeURIComponent(groupId)}/join?${mbtiQ}`);
      return;
    }

    // ✅ 마지막 fallback
    router.push(`/mbti/create?mbti=${encodeURIComponent(type)}`);
  }



  function resetAll() {
    if (timerRef.current) window.clearTimeout(timerRef.current);
    lockRef.current = false;
    setLocked(false);
    setTap(null);
    setDone(false);
    setResult(null);
    setStep(0);
    setAnswers({});
    answersRef.current = {};
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
    setLocked(true);
    setTap(v);

    const next: Answers = { ...answersRef.current, [q.id]: v };
    answersRef.current = next;
    setAnswers(next);

    const isLast = step === total - 1;

    timerRef.current = window.setTimeout(() => {
      setTap(null);
      setLocked(false);
      lockRef.current = false;

      if (isLast) {
        finish(next); // ✅ 마지막이면 바로 결과
      } else {
        setStep((s) => s + 1); // ✅ 자동 다음
      }
    }, 120);
  }

    // ============================
  // ✅ 결과 화면
  // ============================
  if (done && result) {
  const { type, axes, axisConfidence } = result;

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-extrabold text-slate-500">검사 결과</div>
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

        <button
          type="button"
          onClick={resetAll}
          className="rounded-full px-4 py-2 text-xs font-extrabold text-slate-700 ring-1 ring-black/10 hover:bg-slate-50"
        >
          다시하기
        </button>
      </div>

      <div className="mt-5 grid gap-2">
        <AxisRow left="E" right="I" leftPct={axes.E} rightPct={axes.I} conf={axisConfidence.EI} />
        <AxisRow left="N" right="S" leftPct={axes.N} rightPct={axes.S} conf={axisConfidence.NS} />
        <AxisRow left="T" right="F" leftPct={axes.T} rightPct={axes.F} conf={axisConfidence.TF} />
        <AxisRow left="J" right="P" leftPct={axes.J} rightPct={axes.P} conf={axisConfidence.JP} />
      </div>

      {/* ✅ 결과 카드 우측 하단 버튼 */}
      <div className="mt-6 flex justify-end gap-2">
        {from === "create" && (
          <button
            type="button"
            onClick={() => router.push(`/mbti/create?mbti=${encodeURIComponent(type)}`)}
            className="
              mbti-primary-btn rounded-full px-5 py-2 text-xs font-extrabold text-white
              transition-all duration-200 active:scale-[0.97]
            "
          >
            이 결과로 모임 만들기
          </button>
        )}

        {from === "join" && (
          <button
            type="button"
            onClick={() => goBackWithMbti(type)}
            className="
              mbti-primary-btn rounded-full px-5 py-2 text-xs font-extrabold text-white
              transition-all duration-200 active:scale-[0.97]
            "
          >
            이 결과로 참여하기
          </button>
        )}

        {from === "basic" && (
          <button
            type="button"
            onClick={() => router.push(`/mbti/create?mbti=${encodeURIComponent(type)}`)}
            className="
              mbti-primary-btn rounded-full px-5 py-2 text-xs font-extrabold text-white
              transition-all duration-200 active:scale-[0.97]
            "
          >
            이 결과로 모임 만들기
          </button>
        )}
      </div>


    </div>
  );
}



  // ============================
  // ✅ 진행 화면
  // ============================
  return (
    <div>
      {/* 상단 상태 */}
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
            초기화
        </button>
        </div>

      {/* 진행 바 */}
      <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-slate-200/80 ring-1 ring-black/5">
        <div
            className="h-full rounded-full bg-gradient-to-r from-[#1E88E5] to-[#3ba6ff] transition-[width] duration-300"
            style={{ width: `${progressPct}%` }}
        />
        </div>

      {/* 질문 */}
      <div className="mt-6 min-h-[76px] text-[15px] font-black leading-6 text-slate-900 tracking-tight">
        {q?.text}
        </div>

      {/* 선택지 */}
      <div className="mt-4 grid gap-2">
        {SCALE.map((s) => (
          <button
            key={s.v}
            type="button"
            disabled={locked}
            onClick={() => pick(s.v)}
            className={[
            "group flex items-center justify-between rounded-2xl px-4 py-3 text-left",
            "bg-white/70 ring-1 ring-black/10 shadow-sm",
            "transition-all duration-150",
            "hover:bg-white hover:ring-black/15",
            "active:scale-[0.99]",
            tap === s.v ? "bg-[#EAF3FF] ring-[#1E88E5]/25" : "",
            locked ? "opacity-80" : "",
            ].join(" ")}
          >
            <span className="text-sm font-black text-slate-800">{s.label}</span>
            <span className="text-[11px] font-black text-slate-400 tabular-nums">{s.v}</span>
          </button>
        ))}
      </div>

      <div className="mt-3 text-[11px] font-bold text-slate-500">
        ※ 답을 누르면 자동으로 다음 문항으로 이동합니다.
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
  conf: number; // 0..100
}) {
  const delta = leftPct - 50;                 // -50..+50
  const leanLeft = delta >= 0;                // true면 left 우세
  const diff = Math.round(Math.abs(delta));   // 0..50
  const halfFill = Math.min(100, diff * 2);   // 0..100

  const winner = leftPct >= rightPct ? left : right;
  const isLeftWin = winner === left;
  const isRightWin = winner === right;
  const color = traitColor(winner);

  const leftFill = leanLeft ? halfFill : 0;
  const rightFill = leanLeft ? 0 : halfFill;

  return (
    <div className="mbti-card-soft rounded-3xl p-4 ring-1 ring-black/10">
      {/* 상단 라벨 */}
      <div className="grid grid-cols-[96px_1fr_96px] items-center">
        {/* left */}
        <div className="text-left">
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

        {/* center */}
        <div className="flex justify-center">
          <span className="inline-flex items-center rounded-full bg-slate-900/5 px-2.5 py-1 text-[11px] font-black text-slate-700 ring-1 ring-black/5 tabular-nums">
            정확도 {conf}%
          </span>
        </div>

        {/* right */}
        <div className="text-right">
          <div className="inline-flex items-end gap-1.5">
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

      {/* 게이지 */}
      <div className="relative mt-3 h-3.5 w-full overflow-hidden rounded-full bg-slate-200/80 ring-1 ring-black/5">
        <div className="absolute inset-0 flex">
          {/* left half */}
          <div className="relative h-full w-1/2 overflow-hidden">
            <div
              className="absolute right-0 top-0 h-full rounded-l-full transition-[width] duration-300"
              style={{ width: `${leftFill}%`, backgroundColor: color }}
            />
          </div>

          {/* right half */}
          <div className="relative h-full w-1/2 overflow-hidden">
            <div
              className="absolute left-0 top-0 h-full rounded-r-full transition-[width] duration-300"
              style={{ width: `${rightFill}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {/* 중앙 라인 */}
        <div className="absolute left-1/2 top-0 h-full w-[2px] -translate-x-1/2 bg-slate-400/70" />
      </div>

      {/* 선택된 성향 한 줄 설명 */}
        <div className="mt-2 text-[11px] font-semibold text-slate-600">
        {TRAIT_ONE_LINER[winner]}
        </div>
    </div>
  );
}


