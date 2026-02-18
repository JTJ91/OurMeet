"use server";

import { revalidatePath, updateTag } from "next/cache";
import { prisma } from "@/lib/mbti/prisma";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import ko from "../../../../messages/ko.json";
import en from "../../../../messages/en.json";
import ja from "../../../../messages/ja.json";
import { isNicknameLengthValid, sanitizeNicknameInput } from "@/features/mbti/lib/nickname";
import {
  normalizeConflictStyle,
  normalizeEnergyLevel,
} from "@/lib/mbti/memberPrefs";
import {
  resolveAxisPercentInput,
  toStrengthFromPercent,
} from "@/lib/mbti/axisPercent";

type JudgeStyle = "LOGIC" | "PEOPLE";
type InfoStyle = "IDEA" | "FACT";
type OwnerMemberData = {
  nickname: string;
  mbti: string;
  isOwner: boolean;
  judgeStyle: JudgeStyle;
  infoStyle: InfoStyle;
  ideaStrength?: number;
  factStrength?: number;
  logicStrength?: number;
  peopleStrength?: number;
  ePercent?: number;
  nPercent?: number;
  tPercent?: number;
  jPercent?: number;
  conflictStyle?: "DIRECT" | "AVOID" | "MEDIATE" | "BURST";
  energy?: "LOW" | "MID" | "HIGH";
  conflictExplicit?: boolean;
  energyExplicit?: boolean;
};

type ActionErrors = {
  required: string;
  nicknameLength: string;
  mbtiInvalid: string;
  memberCreateFailed: string;
};

let supportsNewMemberColumns: boolean | null = null;

const actionErrorsByLocale: Record<Locale, ActionErrors> = {
  ko: ko.create.actionErrors as ActionErrors,
  en: en.create.actionErrors as ActionErrors,
  ja: ja.create.actionErrors as ActionErrors,
};

function parseLocale(value: FormDataEntryValue | null): Locale {
  const raw = String(value ?? "").trim();
  return locales.includes(raw as Locale) ? (raw as Locale) : defaultLocale;
}

function normalizeGroupName(name: FormDataEntryValue | null) {
  return String(name ?? "").trim();
}

function normalizeNickname(nick: FormDataEntryValue | null) {
  return sanitizeNicknameInput(String(nick ?? ""));
}

function normalizeMbti(mbti: FormDataEntryValue | null) {
  return String(mbti ?? "").replace(/\s/g, "").toUpperCase();
}

function normalizeJudgeStyle(v: unknown): JudgeStyle {
  return v === "PEOPLE" ? "PEOPLE" : "LOGIC";
}

function normalizeInfoStyle(v: unknown): InfoStyle {
  return v === "FACT" ? "FACT" : "IDEA";
}

function parseExplicitFlag(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim().toLowerCase();
  return raw === "1" || raw === "true" || raw === "on" || raw === "yes";
}

function isSchemaCompatibilityError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? String((error as { code?: unknown }).code ?? "") : "";
  if (code === "P2021" || code === "P2022") return true;
  const message =
    "message" in error ? String((error as { message?: unknown }).message ?? "") : "";
  if (!message) return false;
  return (
    message.includes("Unknown arg") ||
    message.includes("Unknown field") ||
    message.includes("column") && message.includes("does not exist")
  );
}

function stripAxisAndExplicit(data: OwnerMemberData): OwnerMemberData {
  const {
    ePercent,
    nPercent,
    tPercent,
    jPercent,
    conflictExplicit,
    energyExplicit,
    ...rest
  } = data;
  void ePercent;
  void nPercent;
  void tPercent;
  void jPercent;
  void conflictExplicit;
  void energyExplicit;
  return rest;
}

function stripPrefsForLegacy(data: OwnerMemberData): OwnerMemberData {
  const {
    ideaStrength,
    factStrength,
    logicStrength,
    peopleStrength,
    conflictStyle,
    energy,
    ...rest
  } = data;
  void ideaStrength;
  void factStrength;
  void logicStrength;
  void peopleStrength;
  void conflictStyle;
  void energy;
  return rest;
}

async function createGroupWithOwner(
  groupName: string,
  owner: OwnerMemberData
) {
  return prisma.group.create({
    data: {
      name: groupName,
      maxMembers: 20,
      members: { create: owner },
    },
    select: {
      id: true,
      name: true,
      members: { select: { id: true }, take: 1 },
    },
  });
}

function nicknameLengthError(locale: Locale) {
  if (locale === "en") return "Nickname must be up to 6 English chars or 3 Korean/Japanese chars (no spaces).";
  if (locale === "ja") return "ニックネームは空白なしで、英字は最大6文字・韓国語/日本語は最大3文字です。";
  return "별명은 공백 없이 한글/일본어 3자, 영어 6자까지 가능해요.";
}

function localeBase(locale: Locale) {
  return locale === "ko" ? "" : `/${locale}`;
}

export async function createGroupAction(formData: FormData) {
  const locale = parseLocale(formData.get("locale"));
  const err = actionErrorsByLocale[locale];

  const groupName = normalizeGroupName(formData.get("groupName"));
  const nickname = normalizeNickname(formData.get("nickname"));
  const mbti = normalizeMbti(formData.get("mbti"));
  const judgeStyle = normalizeJudgeStyle(formData.get("judge"));
  const infoStyle = normalizeInfoStyle(formData.get("info"));
  const { ePercent, nPercent, tPercent, jPercent } = resolveAxisPercentInput({
    mbti,
    ePercent: formData.get("ePercent"),
    nPercent: formData.get("nPercent"),
    tPercent: formData.get("tPercent"),
    jPercent: formData.get("jPercent"),
    ideaStrength: formData.get("ideaStrength"),
    logicStrength: formData.get("logicStrength"),
  });

  const { ideaStrength, factStrength, logicStrength, peopleStrength } = toStrengthFromPercent({
    nPercent,
    tPercent,
  });

  const conflictRaw = String(formData.get("conflictStyle") ?? "").trim();
  const energyRaw = String(formData.get("energy") ?? "").trim();
  const conflictExplicit = parseExplicitFlag(formData.get("conflictExplicit")) && !!conflictRaw;
  const energyExplicit = parseExplicitFlag(formData.get("energyExplicit")) && !!energyRaw;
  const conflictStyle = conflictRaw ? normalizeConflictStyle(conflictRaw) : "MEDIATE";
  const energy = energyRaw ? normalizeEnergyLevel(energyRaw) : "MID";

  if (!groupName || !nickname || !mbti) {
    throw new Error(err.required);
  }
  if (!isNicknameLengthValid(nickname)) {
    throw new Error(nicknameLengthError(locale));
  }
  if (!/^[EI][NS][TF][JP]$/.test(mbti)) {
    throw new Error(err.mbtiInvalid);
  }

  const ownerBase: OwnerMemberData = {
    nickname,
    mbti,
    isOwner: true,
    judgeStyle,
    infoStyle,
    ideaStrength,
    factStrength,
    logicStrength,
    peopleStrength,
    ePercent,
    nPercent,
    tPercent,
    jPercent,
    conflictStyle,
    energy,
    conflictExplicit,
    energyExplicit,
  };

  let group: Awaited<ReturnType<typeof createGroupWithOwner>> | null = null;
  if (supportsNewMemberColumns !== false) {
    try {
      group = await createGroupWithOwner(groupName, ownerBase);
      supportsNewMemberColumns = true;
    } catch (error) {
      if (!isSchemaCompatibilityError(error)) throw error;
      console.warn("⚠ DB schema mismatch: falling back to legacy mode");
      supportsNewMemberColumns = false;
    }
  }

  if (!group) {
    const legacyData = stripAxisAndExplicit(ownerBase);
    try {
      group = await createGroupWithOwner(groupName, legacyData);
    } catch (legacyError) {
      if (!isSchemaCompatibilityError(legacyError)) throw legacyError;
      group = await createGroupWithOwner(groupName, stripPrefsForLegacy(legacyData));
    }
  }

  const memberId = group.members[0]?.id;
  if (!memberId) throw new Error(err.memberCreateFailed);

  const base = localeBase(locale);
  revalidatePath("/mbti");
  revalidatePath(`/mbti/g/${group.id}`);
  if (base) {
    revalidatePath(`${base}/mbti`);
    revalidatePath(`${base}/mbti/g/${group.id}`);
  }
  updateTag(`group-rankings:${group.id}`);

  return {
    groupId: group.id,
    groupName: group.name,
    memberId,
  };
}
