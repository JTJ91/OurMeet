// lib/mbtiCompat.ts
// ✅ “동점 줄이고 분포 예쁘게” 재튜닝 버전 (바로 복붙용)

export type Level = 1 | 2 | 3 | 4 | 5;

type Attitude = "E" | "I";
type Perceiving = "N" | "S";
type Judging = "T" | "F";
type Lifestyle = "J" | "P";

type Func = "Ni" | "Ne" | "Si" | "Se" | "Ti" | "Te" | "Fi" | "Fe";
type Stack = [Func, Func, Func, Func];

function norm(mbti: string) {
  return (mbti || "").trim().toUpperCase();
}

function parseType(mbtiRaw: string): [Attitude, Perceiving, Judging, Lifestyle] | null {
  const mbti = norm(mbtiRaw);
  if (!/^[EI][NS][TF][JP]$/.test(mbti)) return null;
  return [mbti[0] as Attitude, mbti[1] as Perceiving, mbti[2] as Judging, mbti[3] as Lifestyle];
}

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

  const fix = (f: Func) => {
    const core = f[0] as any;
    const att = f[1] as any;
    return (`${core}${att}`) as Func;
  };

  return [fix(dom), fix(aux), fix(third), fix(inferior)];
}

// -----------------------------
// ✅ 동점 줄이기용 타이브레이커 (0.0~1.9)
// -----------------------------
function pairTiebreak(a: string, b: string) {
  const s = `${norm(a)}-${norm(b)}`;
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return (h % 20) / 10; // 0.0, 0.1, ... 1.9
}

// -----------------------------
// ✅ 재튜닝된 점수 엔진 (분해능↑, 분포 안정화)
// -----------------------------
function scorePair(a: Stack, b: Stack): number {
  const core = (f: string) => f[0] as "N" | "S" | "T" | "F";
  const att = (f: string) => f[1] as "i" | "e";

  const sameCore = (x: string, y: string) => core(x) === core(y);
  const sameFunc = (x: string, y: string) => x === y;
  const oppAttSameCore = (x: string, y: string) => sameCore(x, y) && att(x) !== att(y);

  // 위치 중요도: dom > aux > third > inferior
  const posW = [1.0, 0.82, 0.56, 0.36] as const;

  let s = 50;

  // 1) 같은 기능(Te/Te 등) 충돌: 위치 가중으로 촘촘하게 감점
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!sameFunc(a[i], b[j])) continue;
      const w = posW[i] * posW[j];
      s -= 9.2 * w + (i === 0 && j === 0 ? 5.8 : 0);
    }
  }

  // 2) 같은 core + 태도 반대(Ne↔Ni 등) 보완: 위치 가중으로 촘촘하게 가점
  for (let i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      if (!oppAttSameCore(a[i], b[j])) continue;
      const w = posW[i] * posW[j];
      s += 5.4 * w + (i <= 1 && j <= 1 ? 1.9 : 0);
    }
  }

  // 3) “대표 시너지” (dom-aux / aux-dom / third-inferior 등) — 과하지 않게 세분화
  if (oppAttSameCore(a[1], b[0])) s += 15.4; // A aux ↔ B dom
  if (oppAttSameCore(a[0], b[1])) s += 12.6; // A dom ↔ B aux
  if (oppAttSameCore(a[2], b[3])) s += 6.0;  // A third ↔ B inf
  if (oppAttSameCore(a[3], b[2])) s += 4.0;  // A inf ↔ B third

  // 4) “대화/문제해결 결” 보정 (같은 core면 약가점, 단 태도까지 같으면 약감점)
  if (sameCore(a[0], b[0])) s += 3.2;
  if (sameCore(a[1], b[1])) s += 2.4;
  if (sameCore(a[0], b[0]) && att(a[0]) === att(b[0])) s -= 2.4; // dom core+att까지 같으면 경쟁/답답

  // 5) “리듬 매칭” (A dom ↔ B aux, A aux ↔ B dom)
  const coreMatch = (x: string, y: string) => (sameCore(x, y) ? 1 : 0);
  s += coreMatch(a[0], b[1]) * 2.0;
  s += coreMatch(a[1], b[0]) * 1.8;

  // 6) 생활 리듬: dom 태도(e/i) 반대면(한쪽 i-dom, 한쪽 e-dom) 작은 가점
  if (att(a[0]) !== att(b[0])) s += 1.8;

  // 7) 판단/인식 축(간접): dom core가 T/F vs N/S 다르면 “역할 분담” 가점(아주 약하게)
  const isJudgingCore = (c: "N" | "S" | "T" | "F") => c === "T" || c === "F";
  if (isJudgingCore(core(a[0])) !== isJudgingCore(core(b[0]))) s += 1.1;

  // 8) 비선형 압축: 극단값 쏠림/계단감 완화 (50 기준 S-curve)
  const d = s - 50;
  s = 50 + Math.tanh(d / 30) * 30;

  return Math.max(0, Math.min(100, s));
}

// -----------------------------
// ✅ 레벨: 분포가 예쁘게 나오도록 컷 재튜닝
// (기존보다 3이 너무 많아지는 걸 방지)
// -----------------------------
function levelFromScore(score: number): Level {
  // 목표: 2/3 쏠림 ↓, 4 비중 ↑, 5/1은 여전히 드물게
  if (score >= 90) return 5; // 찰떡궁합 (드물게)
  if (score >= 66) return 4; // 합좋은편 (← 여기 크게 늘어남)
  if (score >= 52) return 3; // 그럭저럭
  if (score >= 38) return 2; // 조율필요
  return 1;                  // 한계임박 (드물게)
}



// -----------------------------
// ✅ 외부 API
// -----------------------------
export function calcCompatScore(centerMbti: string, otherMbti: string): number {
  const A = stackOf(centerMbti);
  const B = stackOf(otherMbti);
  if (!A || !B) return 50;

  const ab = scorePair(A, B);
  const ba = scorePair(B, A);

  // 평균 + 미세 타이브레이커(동점 감소)
  const raw = (ab + ba) / 2;
  const withTie = raw + pairTiebreak(centerMbti, otherMbti);

  return Math.max(0, Math.min(100, Math.round(withTie)));
}

export function calcCompatLevel(centerMbti: string, otherMbti: string): Level {
  const score = calcCompatScore(centerMbti, otherMbti);
  return levelFromScore(score);
}
