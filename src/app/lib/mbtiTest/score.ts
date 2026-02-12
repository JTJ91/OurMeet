// app/lib/mbtiTest/score.ts
import { QUESTIONS, type Pole } from "./questions";

export type Answers = Record<string, number>; // q01~q60 => 1~5

type AxisPct = {
  E: number; I: number;
  N: number; S: number;
  T: number; F: number;
  J: number; P: number;
};

export type MbtiTestResult = {
  type: string;
  axes: AxisPct;
  confidence: number; // ✅ 최종(패널티 반영)
  axisConfidence: { EI: number; NS: number; TF: number; JP: number };
  weakAxes: Array<"EI" | "NS" | "TF" | "JP">;

  // ✅ 디버그/표시용(원하면 모달에서 보여줘도 됨)
  penalties: {
    consistency: number; // 0~20
    neutral: number;     // 0~15
  };
};

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

// 1~5 => 0~1
function norm01(v: number) {
  const x = clamp(v, 1, 5);
  return (x - 1) / 4;
}

// 1~5 => -1..1 (일관성 체크용)
function normSigned(v: number) {
  const x = clamp(v, 1, 5);
  return (x - 3) / 2; // 1:-1, 2:-0.5, 3:0, 4:0.5, 5:1
}

function pickTypeLetter(posPct: number, pos: string, neg: string) {
  return posPct >= 50 ? pos : neg;
}

export function scoreMbti(answers: Answers): MbtiTestResult {
  const raw: Record<Pole, number> = { E: 0, I: 0, N: 0, S: 0, T: 0, F: 0, J: 0, P: 0 };

  let neutralCount = 0;

  for (const q of QUESTIONS) {
    const v = answers[q.id];
    if (!v) continue;

    if (v === 3) neutralCount += 1;

    const w = q.weight ?? 1;
    raw[q.pole] += norm01(v) * w;
  }

  const pct = (a: number, b: number) => {
    const sum = a + b;
    if (sum <= 0) return 50;
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

  const axisConf = (posPct: number) => Math.round(Math.abs(2 * posPct - 100)); // 0..100

  const axisConfidence = {
    EI: axisConf(E),
    NS: axisConf(N),
    TF: axisConf(T),
    JP: axisConf(J),
  };

  const weakAxes = (Object.entries(axisConfidence) as Array<[keyof typeof axisConfidence, number]>)
    .filter(([, c]) => c < 20)
    .map(([k]) => k);

  // ✅ 기본 신뢰도(4축 명확도 평균)
  const baseConfidence = Math.round(
    (axisConfidence.EI + axisConfidence.NS + axisConfidence.TF + axisConfidence.JP) / 4
  );

  // =========================
  // ✅ 1) 일관성 체크(서로 반대 문항 3쌍)
  // - 반대 쌍인데 둘 다 강하게 동의(또는 둘 다 강하게 비동의)하면 일관성 ↓
  // - signed 값 곱이 양수일수록(같은 방향일수록) "반대쌍"에선 모순
  // =========================
  const pairs: Record<string, number[]> = {};
  for (const q of QUESTIONS) {
    if (!q.checkPair) continue;
    const v = answers[q.id];
    if (!v) continue;
    (pairs[q.checkPair] ||= []).push(v);
  }

  let consistencyPenalty = 0; // 0~20
  {
    const pairKeys = Object.keys(pairs);
    if (pairKeys.length) {
      let sumIncons = 0;
      let used = 0;

      for (const key of pairKeys) {
        const arr = pairs[key];
        if (!arr || arr.length !== 2) continue;

        const a = normSigned(arr[0]);
        const b = normSigned(arr[1]);
        const prod = a * b;

        // 반대쌍에서 prod가 +면 모순(같이 동의/같이 비동의)
        const incons = Math.max(0, prod); // 0..1
        sumIncons += incons;
        used += 1;
      }

      if (used > 0) {
        const avg = sumIncons / used; // 0..1
        consistencyPenalty = Math.round(avg * 20); // 최대 20
      }
    }
  }

  // =========================
  // ✅ 2) 보통(3) 과다 패널티
  // - 전부 3이면 축 구분이 어려워서 신뢰도 낮게
  // =========================
  let neutralPenalty = 0; // 0~15
  {
    // 60문항 중 3이 22개 이상이면 패널티 시작 (대략 1/3 이상)
    const over = Math.max(0, neutralCount - 21);
    // over가 0..39 → 0..15로 압축
    neutralPenalty = Math.min(15, Math.round((over / 39) * 15));
  }

  const confidence = clamp(baseConfidence - consistencyPenalty - neutralPenalty, 0, 100);

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
      neutral: neutralPenalty,
    },
  };
}
