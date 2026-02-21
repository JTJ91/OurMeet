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
  type ConflictStyle,
  type EnergyLevel,
} from "@/lib/mbti/memberPrefs";
import {
  resolveAxisPercentInput,
  toStrengthFromPercent,
} from "@/lib/mbti/axisPercent";

type ActionErrors = {
  required: string;
  mbtiInvalid: string;
  groupNotFound: string;
  groupFull: string;
};

let supportsNewMemberColumns: boolean | null = null;

type MemberCreateData = {
  groupId: string;
  nickname: string;
  mbti: string;
  judgeStyle: "LOGIC" | "PEOPLE";
  infoStyle: "IDEA" | "FACT";
  ideaStrength?: number;
  factStrength?: number;
  logicStrength?: number;
  peopleStrength?: number;
  ePercent?: number;
  nPercent?: number;
  tPercent?: number;
  jPercent?: number;
  conflictStyle?: ConflictStyle;
  energy?: EnergyLevel;
  conflictExplicit?: boolean;
  energyExplicit?: boolean;
};

const actionErrorsByLocale: Record<Locale, ActionErrors> = {
  ko: ko.join.actionErrors as ActionErrors,
  en: en.join.actionErrors as ActionErrors,
  ja: ja.join.actionErrors as ActionErrors,
};

function parseLocale(value: FormDataEntryValue | null): Locale {
  const raw = String(value ?? "").trim();
  return locales.includes(raw as Locale) ? (raw as Locale) : defaultLocale;
}

function normalizeMbti(s: string) {
  return s.replace(/\s/g, "").toUpperCase();
}

function normalizeJudge(v: unknown) {
  const s = String(v ?? "").toUpperCase();
  return s === "PEOPLE" ? "PEOPLE" : "LOGIC";
}

function normalizeInfo(v: unknown) {
  const s = String(v ?? "").toUpperCase();
  return s === "FACT" ? "FACT" : "IDEA";
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

function stripAxisAndExplicit(data: MemberCreateData): MemberCreateData {
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

function stripPrefsForLegacy(data: MemberCreateData): MemberCreateData {
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

function nicknameLengthError(locale: Locale) {
  if (locale === "en") return "Nickname must be up to 6 English chars or 3 Korean/Japanese chars (no spaces).";
  if (locale === "ja") return "ニックネームは空白なしで、英字は最大6文字・韓国語/日本語は最大3文字です。";
  return "별명은 공백 없이 한글/일본어 3자, 영어 6자까지 가능해요.";
}

function localeBase(locale: Locale) {
  return `/${locale}`;
}

export async function joinGroupAction(formData: FormData) {
  const locale = parseLocale(formData.get("locale"));
  const err = actionErrorsByLocale[locale];

  const groupId = String(formData.get("groupId") || "").trim();
  const nickname = sanitizeNicknameInput(String(formData.get("nickname") || ""));
  const mbti = normalizeMbti(String(formData.get("mbti") || ""));
  const judge = normalizeJudge(formData.get("judge"));
  const info = normalizeInfo(formData.get("info"));
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

  if (!groupId || !nickname || !mbti) {
    throw new Error(err.required);
  }
  if (!isNicknameLengthValid(nickname)) {
    throw new Error(nicknameLengthError(locale));
  }

  if (!/^[EI][NS][TF][JP]$/.test(mbti)) {
    throw new Error(err.mbtiInvalid);
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    select: {
      id: true,
      name: true,
      maxMembers: true,
      members: { select: { id: true } },
    },
  });
  if (!group) throw new Error(err.groupNotFound);

  if (group.members.length >= group.maxMembers) {
    throw new Error(err.groupFull);
  }

  const memberBase: MemberCreateData = {
    groupId,
    nickname,
    mbti,
    judgeStyle: judge,
    infoStyle: info,
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

  let member: { id: string } | null = null;
  if (supportsNewMemberColumns !== false) {
    try {
      member = await prisma.member.create({
        data: memberBase,
        select: { id: true },
      });
      supportsNewMemberColumns = true;
    } catch (error) {
      if (!isSchemaCompatibilityError(error)) throw error;
      console.warn("⚠ DB schema mismatch: falling back to legacy mode");
      supportsNewMemberColumns = false;
    }
  }

  if (!member) {
    const legacyData = stripAxisAndExplicit(memberBase);
    try {
      member = await prisma.member.create({
        data: legacyData,
        select: { id: true },
      });
    } catch (legacyError) {
      if (!isSchemaCompatibilityError(legacyError)) throw legacyError;
      member = await prisma.member.create({
        data: stripPrefsForLegacy(legacyData),
        select: { id: true },
      });
    }
  }

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
    memberId: member.id,
  };
}
