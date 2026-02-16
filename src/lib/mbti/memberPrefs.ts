export type ConflictStyle = "DIRECT" | "AVOID" | "MEDIATE" | "BURST";
export type EnergyLevel = "LOW" | "MID" | "HIGH";

export type MemberPrefs = {
  ideaStrength: number;
  factStrength: number;
  logicStrength: number;
  peopleStrength: number;
  conflictStyle: ConflictStyle;
  energy: EnergyLevel;
};

export const DEFAULT_MEMBER_PREFS: MemberPrefs = {
  ideaStrength: 50,
  factStrength: 50,
  logicStrength: 50,
  peopleStrength: 50,
  conflictStyle: "MEDIATE",
  energy: "MID",
};

export type MemberStrengths = Pick<
  MemberPrefs,
  "ideaStrength" | "factStrength" | "logicStrength" | "peopleStrength"
>;

export const DEFAULT_MEMBER_STRENGTHS: MemberStrengths = {
  ideaStrength: 50,
  factStrength: 50,
  logicStrength: 50,
  peopleStrength: 50,
};

export function clampStrength(value: unknown): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").trim());
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function normalizeConflictStyle(value: unknown): ConflictStyle {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === "DIRECT" || raw === "AVOID" || raw === "MEDIATE" || raw === "BURST") return raw;
  return "MEDIATE";
}

export function normalizeEnergyLevel(value: unknown): EnergyLevel {
  const raw = String(value ?? "").trim().toUpperCase();
  if (raw === "LOW" || raw === "MID" || raw === "HIGH") return raw;
  return "MID";
}

export function normalizeMemberPrefs(
  input?: Partial<MemberPrefs> | null
): MemberPrefs {
  if (!input) return { ...DEFAULT_MEMBER_PREFS };

  return {
    ideaStrength: clampStrength(input.ideaStrength),
    factStrength: clampStrength(input.factStrength),
    logicStrength: clampStrength(input.logicStrength),
    peopleStrength: clampStrength(input.peopleStrength),
    conflictStyle: normalizeConflictStyle(input.conflictStyle),
    energy: normalizeEnergyLevel(input.energy),
  };
}

export function prefillStrengthsFromMbti(
  mbtiRaw: string,
  base: MemberStrengths = DEFAULT_MEMBER_STRENGTHS
): MemberStrengths {
  const mbti = (mbtiRaw || "").trim().toUpperCase();
  const out: MemberStrengths = {
    ideaStrength: clampStrength(base.ideaStrength),
    factStrength: clampStrength(base.factStrength),
    logicStrength: clampStrength(base.logicStrength),
    peopleStrength: clampStrength(base.peopleStrength),
  };

  const axisInfo = mbti[1];
  const axisJudge = mbti[2];

  if (axisInfo === "N") out.ideaStrength = clampStrength(out.ideaStrength + 10);
  if (axisInfo === "S") out.factStrength = clampStrength(out.factStrength + 10);

  if (axisJudge === "T") out.logicStrength = clampStrength(out.logicStrength + 10);
  if (axisJudge === "F") out.peopleStrength = clampStrength(out.peopleStrength + 10);

  return out;
}

export function toLegacyJudgeStyle(prefs: MemberStrengths): "LOGIC" | "PEOPLE" {
  return prefs.logicStrength >= prefs.peopleStrength ? "LOGIC" : "PEOPLE";
}

export function toLegacyInfoStyle(prefs: MemberStrengths): "IDEA" | "FACT" {
  return prefs.ideaStrength >= prefs.factStrength ? "IDEA" : "FACT";
}
