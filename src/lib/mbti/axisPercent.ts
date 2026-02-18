import { clampStrength } from "@/lib/mbti/memberPrefs";

export type AxisPercentState = {
  ePercent: number;
  nPercent: number;
  tPercent: number;
  jPercent: number;
};

export type StrengthFromPercent = {
  ideaStrength: number;
  factStrength: number;
  logicStrength: number;
  peopleStrength: number;
};

export const DEFAULT_AXIS_PERCENTS: AxisPercentState = {
  ePercent: 50,
  nPercent: 50,
  tPercent: 50,
  jPercent: 50,
};

export function clampPercent(value: unknown) {
  return clampStrength(value);
}

export function prefillAxisPercentFromMbti(mbtiRaw: string): AxisPercentState {
  const mbti = (mbtiRaw || "").trim().toUpperCase();
  return {
    ePercent: mbti[0] === "E" ? 65 : mbti[0] === "I" ? 35 : 50,
    nPercent: mbti[1] === "N" ? 65 : mbti[1] === "S" ? 35 : 50,
    tPercent: mbti[2] === "T" ? 65 : mbti[2] === "F" ? 35 : 50,
    jPercent: mbti[3] === "J" ? 65 : mbti[3] === "P" ? 35 : 50,
  };
}

function axisLetter(left: string, right: string, valueRaw: unknown, prev?: string) {
  const value = clampPercent(valueRaw);
  if (value > 50) return left;
  if (value < 50) return right;
  if (prev === left || prev === right) return prev;
  return left;
}

export function toMbtiFromAxisPercent(
  input: AxisPercentState & { prevMbti?: string | null }
) {
  const prev = (input.prevMbti || "").trim().toUpperCase();
  return [
    axisLetter("E", "I", input.ePercent, prev[0]),
    axisLetter("N", "S", input.nPercent, prev[1]),
    axisLetter("T", "F", input.tPercent, prev[2]),
    axisLetter("J", "P", input.jPercent, prev[3]),
  ].join("");
}

export function toStrengthFromPercent(input: Pick<AxisPercentState, "nPercent" | "tPercent">): StrengthFromPercent {
  const n = clampPercent(input.nPercent);
  const t = clampPercent(input.tPercent);
  return {
    ideaStrength: n,
    factStrength: 100 - n,
    logicStrength: t,
    peopleStrength: 100 - t,
  };
}

function optionalPercent(value: unknown): number | null {
  if (value == null) return null;
  const raw = String(value).trim();
  if (!raw) return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  return clampPercent(n);
}

export function resolveAxisPercentInput(input: {
  mbti: string;
  ePercent?: unknown;
  nPercent?: unknown;
  tPercent?: unknown;
  jPercent?: unknown;
  ideaStrength?: unknown;
  logicStrength?: unknown;
}): AxisPercentState {
  const mbtiPrefill = prefillAxisPercentFromMbti(input.mbti);

  return {
    ePercent: optionalPercent(input.ePercent) ?? mbtiPrefill.ePercent,
    nPercent: optionalPercent(input.nPercent) ?? optionalPercent(input.ideaStrength) ?? mbtiPrefill.nPercent,
    tPercent: optionalPercent(input.tPercent) ?? optionalPercent(input.logicStrength) ?? mbtiPrefill.tPercent,
    jPercent: optionalPercent(input.jPercent) ?? mbtiPrefill.jPercent,
  };
}
