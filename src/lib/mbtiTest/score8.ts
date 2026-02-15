// app/lib/mbtiTest/score.ts
import { QUESTIONS_8 as QUESTIONS, type Pole } from "./questions8"

export type Answers = Record<string, boolean>; // q01~q08 => true(Yes) / false(No)

type AxisPct = {
  E: number; I: number;
  N: number; S: number;
  T: number; F: number;
  J: number; P: number;
};

export type MbtiTestResult = {
  type: string;
  axes: AxisPct;

  confidence: number; // 0~100
  axisConfidence: { EI: number; NS: number; TF: number; JP: number };
  weakAxes: Array<"EI" | "NS" | "TF" | "JP">;

  penalties: {
    consistency: number; // 0~20
    missing: number;     // 0~20
  };
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function pickTypeLetter(posPct: number, pos: string, neg: string) {
  return posPct >= 50 ? pos : neg;
}

export function scoreMbti(answers: Answers): MbtiTestResult {
  const raw: Record<Pole, number> = {
    E: 0, I: 0,
    N: 0, S: 0,
    T: 0, F: 0,
    J: 0, P: 0,
  };

  let answeredCount = 0;

  // =========================
  // 1️⃣ 점수 집계 (Yes만 +1)
  // =========================
  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (v === undefined) continue;

    answeredCount += 1;

    if (v === true) {
      raw[q.pole] += 1;
    }
  }

  const pct = (a: number, b: number) => {
    const sum = a + b;
    if (sum === 0) return 50;
    return (a / sum) * 100;
  };

  const E = pct(raw.E, raw.I);
  const N = pct(raw.N, raw.S);
  const T = pct(raw.T, raw.F);
  const J = pct(raw.J, raw.P);

  const axes: AxisPct = {
    E: Math.round(E), I: Math.round(100 - E),
    N: Math.round(N), S: Math.round(100 - N),
    T: Math.round(T), F: Math.round(100 - T),
    J: Math.round(J), P: Math.round(100 - J),
  };

  // =========================
  // 2️⃣ 축 명확도 (0~100)
  // =========================
  const axisConf = (posPct: number) =>
    Math.round(Math.abs(2 * posPct - 100)); // 50%면 0, 100%면 100

  const axisConfidence = {
    EI: axisConf(E),
    NS: axisConf(N),
    TF: axisConf(T),
    JP: axisConf(J),
  };

  const weakAxes = (Object.entries(axisConfidence) as Array<[keyof typeof axisConfidence, number]>)
    .filter(([, c]) => c < 25)
    .map(([k]) => k);

  const baseConfidence = Math.round(
    (axisConfidence.EI +
      axisConfidence.NS +
      axisConfidence.TF +
      axisConfidence.JP) / 4
  );

  // =========================
  // 3️⃣ 일관성 체크
  // - 반대 문항인데 둘 다 Yes → 모순
  // - 둘 다 No는 문제 없음
  // =========================
  const pairs: Record<string, boolean[]> = {};

  for (const q of QUESTIONS) {
    if (!q.checkPair) continue;
    const v = answers[q.id];
    if (v === undefined) continue;
    (pairs[q.checkPair] ||= []).push(v);
  }

  let consistencyPenalty = 0;

  {
    let incons = 0;
    let used = 0;

    for (const key of Object.keys(pairs)) {
      const arr = pairs[key];
      if (!arr || arr.length !== 2) continue;

      // 둘 다 Yes면 모순
      if (arr[0] === true && arr[1] === true) {
        incons += 1;
      }

      used += 1;
    }

    if (used > 0) {
      const ratio = incons / used; // 0~1
      consistencyPenalty = Math.round(ratio * 20); // 최대 20점
    }
  }

  // =========================
  // 4️⃣ 누락 패널티
  // =========================
  const missing = QUESTIONS.length - answeredCount;
  const missingPenalty = Math.min(20, missing * 5); // 한 문제당 5점

  const confidence = clamp(
    baseConfidence - consistencyPenalty - missingPenalty,
    0,
    100
  );

  const type =
    pickTypeLetter(E, "E", "I") +
    pickTypeLetter(N, "N", "S") +
    pickTypeLetter(T, "T", "F") +
    pickTypeLetter(J, "J", "P");

  return {
    type,
    axes,
    confidence,
    axisConfidence,
    weakAxes,
    penalties: {
      consistency: consistencyPenalty,
      missing: missingPenalty,
    },
  };
}
