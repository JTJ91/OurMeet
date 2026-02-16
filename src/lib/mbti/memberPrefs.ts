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
