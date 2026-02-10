// lib/mbtiCompat.ts
// ✅ 캔버스/리포트 점수 "완전 동일" 단일 소스 버전 (복붙)

// -----------------------------
// Types
// -----------------------------
export type Level = 1 | 2 | 3 | 4 | 5;
export type ChemType = "STABLE" | "COMPLEMENT" | "SPARK" | "EXPLODE";

type Attitude = "E" | "I";
type Perceiving = "N" | "S";
type Judging = "T" | "F";
type Lifestyle = "J" | "P";

type Func = "Ni" | "Ne" | "Si" | "Se" | "Ti" | "Te" | "Fi" | "Fe";
type Stack = [Func, Func, Func, Func];

export type CompatScore = {
  scoreInt: number;   // 0~100 정수(베이스)
  score: number;      // 0~100 소수점(리포트/캔버스 표시용)  ex) 67.24
  level: Level;       // 1~5 (캔버스 범례/색 통일)
  type: ChemType;     // 안정/보완/스파크/폭발
};

// -----------------------------
// Utils
// -----------------------------
function norm(mbti: string) {
  return (mbti || "").trim().toUpperCase();
}

function parseType(mbtiRaw: string): [Attitude, Perceiving, Judging, Lifestyle] | null {
  const mbti = norm(mbtiRaw);
  if (!/^[EI][NS][TF][JP]$/.test(mbti)) return null;
  return [mbti[0] as Attitude, mbti[1] as Perceiving, mbti[2] as Judging, mbti[3] as Lifestyle];
}

function stableHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function axisDiffCount(a: string, b: string) {
  const A = norm(a);
  const B = norm(b);
  return (
    (A[0] !== B[0] ? 1 : 0) +
    (A[1] !== B[1] ? 1 : 0) +
    (A[2] !== B[2] ? 1 : 0) +
    (A[3] !== B[3] ? 1 : 0)
  );
}

// ✅ 핵심: (a,b) 순서가 바뀌어도 항상 같은 key (jitter 100% 동일)
function pairKey(aId: string, aMbti: string, bId: string, bMbti: string) {
  const A = `${aId}|${norm(aMbti)}`;
  const B = `${bId}|${norm(bMbti)}`;
  return A < B ? `${A}||${B}` : `${B}||${A}`;
}

// -----------------------------
// MBTI stack (인지기능)
// -----------------------------
function stackOf(mbtiRaw: string): Stack | null {
  const p = parseType(mbtiRaw);
  if (!p) return null;
  const [E, N, T, J] = p;

  const judgingFunc = (T === "T" ? "T" : "F") as "T" | "F";
  const perceivingFunc = (N === "N" ? "N" : "S") as "N" | "S";

  // - 외향형(E): J면 외향 판단(Te/Fe), P면 외향 인식(Ne/Se)
  // - 내향형(I): J면 외향 인식(Ne/Se), P면 외향 판단(Te/Fe)
  const extIsJudging = (E === "E" && J === "J") || (E === "I" && J === "P");
  const domIsIntro = E === "I"; // I면 dom=내향, E면 dom=외향

  const makeJ = (att: "e" | "i") => (judgingFunc === "T" ? (`T${att}`) : (`F${att}`)) as Func;
  const makeP = (att: "e" | "i") => (perceivingFunc === "N" ? (`N${att}`) : (`S${att}`)) as Func;

  const Je = makeJ("e");
  const Ji = makeJ("i");
  const Pe = makeP("e");
  const Pi = makeP("i");

  const extFunc = extIsJudging ? Je : Pe;
  const intFunc = extIsJudging ? Pi : Ji;

  const dom = domIsIntro ? intFunc : extFunc;
  const aux = domIsIntro ? extFunc : intFunc;

  const opposite = (f: Func): Func => {
    const last = f[1] as "e" | "i";
    const att = last === "e" ? "i" : "e";
    const core = f[0] as "N" | "S" | "T" | "F";
    return (`${core}${att}`) as Func;
  };

  const third = opposite(aux);
  const inferior = opposite(dom);

  return [dom, aux, third, inferior];
}

// -----------------------------
// Base score engine (0~100 float)
// -----------------------------
function scorePair(a: Stack, b: Stack): number {
  const core = (f: string) => f[0] as "N" | "S" | "T" | "F";
  const att = (f: string) => f[1] as "i" | "e";

  const sameCore = (x: string, y: string) => core(x) === core(y);
  const sameFunc = (x: string, y: string) => x === y;
  const oppAttSameCore = (x: string, y: string) => sameCore(x, y) && att(x) !== att(y);

  const posW = [1.0, 0.82, 0.56, 0.36] as const;

  let s = 50;

  // 1) 같은 기능 충돌 감점
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!sameFunc(a[i], b[j])) continue;
      const w = posW[i] * posW[j];
      s -= 9.2 * w + (i === 0 && j === 0 ? 5.8 : 0);
    }
  }

  // 2) 같은 core + 태도 반대 보완 가점
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!oppAttSameCore(a[i], b[j])) continue;
      const w = posW[i] * posW[j];
      s += 5.4 * w + (i <= 1 && j <= 1 ? 1.9 : 0);
    }
  }

  // 3) 대표 시너지
  if (oppAttSameCore(a[1], b[0])) s += 15.4;
  if (oppAttSameCore(a[0], b[1])) s += 12.6;
  if (oppAttSameCore(a[2], b[3])) s += 6.0;
  if (oppAttSameCore(a[3], b[2])) s += 4.0;

  // 4) 대화/문제해결 결
  if (sameCore(a[0], b[0])) s += 3.2;
  if (sameCore(a[1], b[1])) s += 2.4;
  if (sameCore(a[0], b[0]) && att(a[0]) === att(b[0])) s -= 2.4;

  // 5) 리듬 매칭
  const coreMatch = (x: string, y: string) => (sameCore(x, y) ? 1 : 0);
  s += coreMatch(a[0], b[1]) * 2.0;
  s += coreMatch(a[1], b[0]) * 1.8;

  // 6) 생활 리듬
  if (att(a[0]) !== att(b[0])) s += 1.8;

  // 7) 판단/인식 축
  const isJudgingCore = (c: "N" | "S" | "T" | "F") => c === "T" || c === "F";
  if (isJudgingCore(core(a[0])) !== isJudgingCore(core(b[0]))) s += 1.1;

  // 8) 비선형 압축
  const d = s - 50;
  s = 50 + Math.tanh(d / 30) * 30;

  return Math.max(0, Math.min(100, s));
}

// ✅ 기존 타이브레이커(정수 점수용)
function pairTiebreak(a: string, b: string) {
  const s = `${norm(a)}-${norm(b)}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 20) / 10; // 0.0~1.9
}

// -----------------------------
// Level / Type (리포트/캔버스 공통)
// -----------------------------
export function levelFromScore(scoreInt: number): Level {
  // (캔버스 쪽 기존 레벨 컷 유지)
  if (scoreInt >= 78) return 5;
  if (scoreInt >= 66) return 4;
  if (scoreInt >= 52) return 3;
  if (scoreInt >= 42) return 2;
  return 1;
}

function classifyChemType(a: string, b: string, scoreInt: number): ChemType {
  const A = norm(a);
  const B = norm(b);
  const diff =
    (A[0] !== B[0] ? 1 : 0) +
    (A[1] !== B[1] ? 1 : 0) +
    (A[2] !== B[2] ? 1 : 0) +
    (A[3] !== B[3] ? 1 : 0);

  if (scoreInt >= 72) return diff >= 2 ? "COMPLEMENT" : "STABLE";
  if (scoreInt >= 62) return diff >= 3 ? "SPARK" : "STABLE";
  if (scoreInt >= 54) return diff >= 3 ? "SPARK" : "COMPLEMENT";
  return diff >= 2 ? "EXPLODE" : "SPARK";
}

// ✅ 리포트에서 쓰던 micro(diffBias+jitter)를 "공용"으로
function microFromBase(
  aId: string,
  aMbti: string,
  bId: string,
  bMbti: string,
  scoreInt: number
) {
  const A = norm(aMbti);
  const B = norm(bMbti);

  const diff = axisDiffCount(A, B);

  // ✅ 순서 고정 key (센터 바뀌어도 동일)
  const key = pairKey(aId, A, bId, B);
  const h = stableHash(key) % 1000;
  const jitter = (h / 1000) * 0.09;

  // ✅ 타입은 "표시 점수" 기준으로 맞추기
  const typeFrom = (s: number) => classifyChemType(A, B, s);

  // 1차 타입 (정수 기준)
  let t = typeFrom(scoreInt);

  const diffBiasOf = (tt: ChemType) => {
    if (tt === "STABLE") return (4 - diff) * 0.18;
    if (tt === "COMPLEMENT") return diff * 0.10;
    if (tt === "SPARK") return diff * 0.08;
    return diff * 0.06; // EXPLODE
  };

  // 1차 micro
  let micro = scoreInt + diffBiasOf(t) + jitter;

  // 경계에서 타입 바뀌면 1회 재계산
  const t2 = typeFrom(micro);
  if (t2 !== t) {
    t = t2;
    micro = scoreInt + diffBiasOf(t) + jitter;
  }

  const rounded = Number(micro.toFixed(2));
  return Math.max(0, Math.min(100, rounded));
}



// -----------------------------
// Public APIs
// -----------------------------
export function calcCompatScore(aMbti: string, bMbti: string): number {
  const A = stackOf(aMbti);
  const B = stackOf(bMbti);
  if (!A || !B) return 50;

  const ab = scorePair(A, B);
  const ba = scorePair(B, A);

  const raw = (ab + ba) / 2;
  const withTie = raw + pairTiebreak(aMbti, bMbti);

  return Math.max(0, Math.min(100, Math.round(withTie)));
}

export function calcCompatLevel(aMbti: string, bMbti: string): Level {
  const scoreInt = calcCompatScore(aMbti, bMbti);
  return levelFromScore(scoreInt);
}

// ✅ 캔버스/리포트가 "똑같은 점수" 쓰게 하는 단일 함수
  export function getCompatScore(
  aId: string,
  aMbti: string,
  bId: string,
  bMbti: string
): CompatScore {
  const scoreInt = calcCompatScore(aMbti, bMbti);                 // 정수
  const score = microFromBase(aId, aMbti, bId, bMbti, scoreInt);  // 소수점(표시용)

  const level = levelFromScore(score);               // ✅ micro 기준 (색=표시점수와 동기화)
  const type  = classifyChemType(aMbti, bMbti, score); // ✅ micro 기준(원하면)

  return { scoreInt, score, level, type };
}


