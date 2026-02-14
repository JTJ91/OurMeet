"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/app/lib/mbti/prisma";
import { defaultLocale, locales, type Locale } from "@/i18n/config";
import ko from "../../../../../messages/ko.json";
import en from "../../../../../messages/en.json";
import ja from "../../../../../messages/ja.json";
import { isNicknameLengthValid, sanitizeNicknameInput } from "@/app/[locale]/mbti/lib/nickname";

type JudgeStyle = "LOGIC" | "PEOPLE";
type InfoStyle = "IDEA" | "FACT";

type ActionErrors = {
  required: string;
  nicknameLength: string;
  mbtiInvalid: string;
  memberCreateFailed: string;
};

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

function nicknameLengthError(locale: Locale) {
  if (locale === "en") return "Nickname must be up to 6 English chars or 3 Korean/Japanese chars (no spaces).";
  if (locale === "ja") return "ニックネームは空白なしで、英字は最大6文字・韓国語/日本語は最大3文字です。";
  return "별명은 공백 없이 한글/일본어 3자, 영어 6자까지 가능해요.";
}

export async function createGroupAction(formData: FormData) {
  const locale = parseLocale(formData.get("locale"));
  const err = actionErrorsByLocale[locale];

  const groupName = normalizeGroupName(formData.get("groupName"));
  const nickname = normalizeNickname(formData.get("nickname"));
  const mbti = normalizeMbti(formData.get("mbti"));
  const judgeStyle = normalizeJudgeStyle(formData.get("judge"));
  const infoStyle = normalizeInfoStyle(formData.get("info"));

  if (!groupName || !nickname || !mbti) {
    throw new Error(err.required);
  }
  if (!isNicknameLengthValid(nickname)) {
    throw new Error(nicknameLengthError(locale));
  }
  if (!/^[EI][NS][TF][JP]$/.test(mbti)) {
    throw new Error(err.mbtiInvalid);
  }

  const group = await prisma.group.create({
    data: {
      name: groupName,
      maxMembers: 20,
      members: {
        create: {
          nickname,
          mbti,
          isOwner: true,
          judgeStyle,
          infoStyle,
        },
      },
    },
    select: {
      id: true,
      name: true,
      members: { select: { id: true }, take: 1 },
    },
  });

  const memberId = group.members[0]?.id;
  if (!memberId) throw new Error(err.memberCreateFailed);

  revalidatePath("/mbti");
  revalidatePath(`/mbti/g/${group.id}`);

  return {
    groupId: group.id,
    groupName: group.name,
    memberId,
  };
}
