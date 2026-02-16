"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/mbti/prisma";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import ko from "../../../../messages/ko.json";
import en from "../../../../messages/en.json";
import ja from "../../../../messages/ja.json";
import { isNicknameLengthValid, sanitizeNicknameInput } from "@/features/mbti/lib/nickname";
import {
  clampStrength,
  normalizeConflictStyle,
  normalizeEnergyLevel,
} from "@/lib/mbti/memberPrefs";

type ActionErrors = {
  required: string;
  mbtiInvalid: string;
  groupNotFound: string;
  groupFull: string;
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

function nicknameLengthError(locale: Locale) {
  if (locale === "en") return "Nickname must be up to 6 English chars or 3 Korean/Japanese chars (no spaces).";
  if (locale === "ja") return "ニックネームは空白なしで、英字は最大6文字・韓国語/日本語は最大3文字です。";
  return "별명은 공백 없이 한글/일본어 3자, 영어 6자까지 가능해요.";
}

export async function joinGroupAction(formData: FormData) {
  const locale = parseLocale(formData.get("locale"));
  const err = actionErrorsByLocale[locale];

  const groupId = String(formData.get("groupId") || "").trim();
  const nickname = sanitizeNicknameInput(String(formData.get("nickname") || ""));
  const mbti = normalizeMbti(String(formData.get("mbti") || ""));
  const judge = normalizeJudge(formData.get("judge"));
  const info = normalizeInfo(formData.get("info"));
  const ideaStrength = clampStrength(formData.get("ideaStrength"));
  const factStrength = clampStrength(formData.get("factStrength"));
  const logicStrength = clampStrength(formData.get("logicStrength"));
  const peopleStrength = clampStrength(formData.get("peopleStrength"));
  const conflictStyle = normalizeConflictStyle(formData.get("conflictStyle"));
  const energy = normalizeEnergyLevel(formData.get("energy"));

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
    include: { members: true },
  });
  if (!group) throw new Error(err.groupNotFound);

  if (group.members.length >= group.maxMembers) {
    throw new Error(err.groupFull);
  }

  const member = await prisma.member.create({
    data: {
      groupId,
      nickname,
      mbti,
      judgeStyle: judge,
      infoStyle: info,
      ideaStrength,
      factStrength,
      logicStrength,
      peopleStrength,
      conflictStyle,
      energy,
    },
    select: { id: true },
  });

  revalidatePath("/mbti");
  revalidatePath(`/mbti/g/${group.id}`);

  return {
    groupId: group.id,
    groupName: group.name,
    memberId: member.id,
  };
}
