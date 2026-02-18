export type RoleKey = "STRATEGY" | "VIBE" | "EXEC" | "ORGANIZE" | "MEDIATOR";
export type ConflictInput = "DIRECT" | "AVOID" | "MEDIATE" | "BURST" | null;
export type EnergyInput = 1 | 2 | 3 | null;

export type RoleAxisInput = {
  E: number;
  N: number;
  T: number;
  J: number;
};

type RoleAxis01 = {
  E: number;
  N: number;
  T: number;
  J: number;
};

export type RoleCandidateInput = {
  id?: string;
  name: string;
  mbti: string;
  axis: RoleAxisInput;
  conflict: ConflictInput;
  energy: EnergyInput;
};

export type RoleCandidate = RoleCandidateInput & {
  score: number;
};

export const ROLE_KEYS: RoleKey[] = ["STRATEGY", "VIBE", "EXEC", "ORGANIZE", "MEDIATOR"];

type ConflictKey = Exclude<ConflictInput, null>;
type EnergyKey = Exclude<EnergyInput, null>;
type AxisKey = keyof RoleAxis01;
type AxisGate = Partial<Record<AxisKey, { min?: number; max?: number }>>;

export type RoleProfile = {
  coreTypes: string[];
  secondaryTypes?: string[];
  target: { E: number; N: number; T: number; J: number };
  conflictBonus: Record<ConflictKey, number>;
  energyBonus: Record<EnergyKey, number>;
  bestWithin: number;
  maxShow: number;
  bonusClamp: { min: number; max: number };
  axisGate?: AxisGate;
  typePremium?: Partial<Record<string, number>>;
};

export const ROLE_PROFILE: Record<RoleKey, RoleProfile> = {
  STRATEGY: {
    coreTypes: ["INTJ", "ENTJ", "INTP", "ENTP"],
    secondaryTypes: ["ISTJ", "ESTJ", "INFJ"],
    target: { E: 0.58, N: 0.88, T: 0.86, J: 0.72 },
    conflictBonus: { DIRECT: 0.02, AVOID: -0.04, MEDIATE: 0.01, BURST: -0.06 },
    energyBonus: { 1: -0.01, 2: 0.01, 3: 0.02 },
    bestWithin: 10,
    maxShow: 2,
    bonusClamp: { min: -0.1, max: 0.1 },
    axisGate: { N: { min: 0.65 }, T: { min: 0.6 } },
  },
  VIBE: {
    coreTypes: ["ENFP", "ENFJ", "ESFP", "ESFJ"],
    secondaryTypes: ["ISFP", "INFP", "ISFJ"],
    target: { E: 0.74, N: 0.58, T: 0.28, J: 0.44 },
    conflictBonus: { DIRECT: -0.02, AVOID: -0.01, MEDIATE: 0.06, BURST: -0.08 },
    energyBonus: { 1: -0.02, 2: 0.01, 3: 0.04 },
    bestWithin: 10,
    maxShow: 2,
    bonusClamp: { min: -0.1, max: 0.1 },
    axisGate: { E: { min: 0.5 }, T: { max: 0.45 } },
  },
  EXEC: {
    coreTypes: ["ESTP", "ESTJ", "ENTJ", "ISTP"],
    secondaryTypes: ["ESFP"],
    target: { E: 0.7, N: 0.26, T: 0.68, J: 0.34 },
    conflictBonus: { DIRECT: 0.05, AVOID: -0.04, MEDIATE: 0.02, BURST: -0.03 },
    energyBonus: { 1: -0.02, 2: 0.02, 3: 0.04 },
    bestWithin: 10,
    maxShow: 2,
    bonusClamp: { min: -0.1, max: 0.1 },
    axisGate: { E: { min: 0.55 }, T: { min: 0.55 }, N: { max: 0.55 } },
    typePremium: { ESTP: 0.03, ENTJ: 0.02, ESTJ: 0.015 },
  },
  ORGANIZE: {
    coreTypes: ["ISTJ", "ESTJ", "INTJ", "ENTJ"],
    secondaryTypes: ["ESFJ", "ISFJ"],
    target: { E: 0.52, N: 0.3, T: 0.74, J: 0.9 },
    conflictBonus: { DIRECT: 0.03, AVOID: -0.05, MEDIATE: 0.02, BURST: -0.07 },
    energyBonus: { 1: 0.0, 2: 0.02, 3: 0.01 },
    bestWithin: 10,
    maxShow: 2,
    bonusClamp: { min: -0.1, max: 0.1 },
    axisGate: { J: { min: 0.7 }, T: { min: 0.55 } },
  },
  MEDIATOR: {
    coreTypes: ["INFJ", "INFP", "ENFJ", "ISFJ"],
    secondaryTypes: ["ENFP", "ESFJ"],
    target: { E: 0.56, N: 0.64, T: 0.22, J: 0.62 },
    conflictBonus: { DIRECT: -0.03, AVOID: -0.02, MEDIATE: 0.06, BURST: -0.08 },
    energyBonus: { 1: 0.01, 2: 0.03, 3: 0.01 },
    bestWithin: 10,
    maxShow: 2,
    bonusClamp: { min: -0.1, max: 0.1 },
    axisGate: { T: { max: 0.45 }, J: { min: 0.5 } },
  },
};

// Legacy exports kept for compatibility; source of truth is ROLE_PROFILE.
export const ROLE_TYPE_MAP: Record<RoleKey, string[]> = ROLE_KEYS.reduce(
  (acc, role) => {
    const cfg = ROLE_PROFILE[role];
    acc[role] = [...cfg.coreTypes, ...(cfg.secondaryTypes ?? [])];
    return acc;
  },
  {} as Record<RoleKey, string[]>
);

export const ROLE_TARGET: Record<RoleKey, RoleAxis01> = ROLE_KEYS.reduce(
  (acc, role) => {
    acc[role] = { ...ROLE_PROFILE[role].target };
    return acc;
  },
  {} as Record<RoleKey, RoleAxis01>
);

export const ROLE_CONFLICT_BONUS: Record<RoleKey, Record<ConflictKey, number>> = ROLE_KEYS.reduce(
  (acc, role) => {
    acc[role] = { ...ROLE_PROFILE[role].conflictBonus };
    return acc;
  },
  {} as Record<RoleKey, Record<ConflictKey, number>>
);

export const ROLE_ENERGY_BONUS: Record<RoleKey, Record<EnergyKey, number>> = ROLE_KEYS.reduce(
  (acc, role) => {
    acc[role] = { ...ROLE_PROFILE[role].energyBonus };
    return acc;
  },
  {} as Record<RoleKey, Record<EnergyKey, number>>
);

function clampPercent(value: number) {
  if (!Number.isFinite(value)) return 50;
  return Math.max(0, Math.min(100, value));
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0.5;
  return Math.max(0, Math.min(1, value));
}

export function axis01(axis: RoleAxisInput): RoleAxis01 {
  return {
    E: clampPercent(axis.E) / 100,
    N: clampPercent(axis.N) / 100,
    T: clampPercent(axis.T) / 100,
    J: clampPercent(axis.J) / 100,
  };
}

export function closenessScore(v: RoleAxis01, target: RoleAxis01) {
  const dE = v.E - target.E;
  const dN = v.N - target.N;
  const dT = v.T - target.T;
  const dJ = v.J - target.J;
  const distance = Math.sqrt(dE * dE + dN * dN + dT * dT + dJ * dJ);
  const maxDistance = 2;
  return clamp01(1 - distance / maxDistance);
}

export function tinyMbtiTieBreaker(mbtiRaw: string) {
  const mbti = String(mbtiRaw ?? "").trim().toUpperCase();
  let h = 0;
  for (let i = 0; i < mbti.length; i++) {
    h = (h * 31 + mbti.charCodeAt(i)) >>> 0;
  }
  return (h % 16) / 10000;
}

export function roleScore(
  role: RoleKey,
  axis: RoleAxisInput,
  conflict: ConflictInput,
  energy: EnergyInput,
  mbti: string
) {
  const cfg = ROLE_PROFILE[role];
  const normalizedMbti = String(mbti ?? "").trim().toUpperCase();
  const base = closenessScore(axis01(axis), cfg.target);
  const rawConflictBonus = conflict ? cfg.conflictBonus[conflict] : 0;
  const rawEnergyBonus = energy ? cfg.energyBonus[energy] : 0;
  const minBonus = Math.min(cfg.bonusClamp.min, cfg.bonusClamp.max);
  const maxBonus = Math.max(cfg.bonusClamp.min, cfg.bonusClamp.max);
  const conflictBonus = Math.max(minBonus, Math.min(maxBonus, rawConflictBonus));
  const energyBonus = Math.max(minBonus, Math.min(maxBonus, rawEnergyBonus));
  const premium = cfg.typePremium?.[normalizedMbti] ?? 0;
  const adjustedBase = base + conflictBonus + energyBonus + premium;
  const tiny = tinyMbtiTieBreaker(normalizedMbti);
  const score = adjustedBase * 100 + tiny;
  return Math.round(score * 100) / 100;
}

function normalizeCandidate(candidate: RoleCandidateInput): RoleCandidateInput {
  return {
    ...candidate,
    mbti: String(candidate.mbti ?? "").trim().toUpperCase(),
  };
}

function applyAxisGate(candidates: RoleCandidateInput[], axisGate?: AxisGate) {
  if (!axisGate) return candidates;

  return candidates.filter((candidate) => {
    const axis = axis01(candidate.axis);
    const gateKeys = Object.keys(axisGate) as AxisKey[];
    for (const key of gateKeys) {
      const gate = axisGate[key];
      if (!gate) continue;
      if (gate.min != null && axis[key] < gate.min) return false;
      if (gate.max != null && axis[key] > gate.max) return false;
    }
    return true;
  });
}

export function pickCandidates(role: RoleKey, members: RoleCandidateInput[]) {
  const cfg = ROLE_PROFILE[role];
  const normalized = members.map(normalizeCandidate);

  // (a) coreTypes 필터 -> (b) axisGate 적용
  const coreFiltered = normalized.filter((m) => cfg.coreTypes.includes(m.mbti));
  const coreCandidates = applyAxisGate(coreFiltered, cfg.axisGate);

  // core에서 후보가 있으면 secondary는 사용하지 않음
  const selectedBase =
    coreCandidates.length > 0
      ? coreCandidates
      : applyAxisGate(
          normalized.filter((m) => (cfg.secondaryTypes ?? []).includes(m.mbti)),
          cfg.axisGate
        );

  if (selectedBase.length === 0) return [] as RoleCandidate[];

  const scored = selectedBase
    .map((m) => ({
      ...m,
      score: roleScore(role, m.axis, m.conflict, m.energy, m.mbti),
    }))
    .sort((a, b) => b.score - a.score);

  const bestScore = scored[0]?.score ?? 0;
  const bestWithin = scored.filter((m) => m.score >= bestScore - cfg.bestWithin);
  return bestWithin.slice(0, cfg.maxShow);
}
