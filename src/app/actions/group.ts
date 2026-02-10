"use server";

import { prisma } from "@/lib/prisma";

type JudgeStyle = "LOGIC" | "PEOPLE";
type InfoStyle = "IDEA" | "FACT";

function removeAllSpaces(str: string) {
  return str.replace(/\s/g, "");
}
function normalizeGroupName(name: FormDataEntryValue | null) {
  return String(name ?? "").trim();
}

function normalizeNickname(nick: FormDataEntryValue | null) {
  return String(nick ?? "")
    .replace(/\s/g, "")
    .slice(0, 3);
}

function normalizeMbti(mbti: FormDataEntryValue | null) {
  return String(mbti ?? "")
    .replace(/\s/g, "")
    .toUpperCase();
}


function normalizeJudgeStyle(v: unknown): JudgeStyle {
  return v === "PEOPLE" ? "PEOPLE" : "LOGIC";
}

function normalizeInfoStyle(v: unknown): InfoStyle {
  return v === "FACT" ? "FACT" : "IDEA";
}

export async function createGroupAction(formData: FormData) {
  const groupNameRaw = formData.get("groupName");
  const nicknameRaw = formData.get("nickname");
  const mbtiRaw = formData.get("mbti");

  const judgeStyleRaw = formData.get("judge");
  const infoStyleRaw  = formData.get("info");

  const groupName = normalizeGroupName(formData.get("groupName"));
  const nickname = normalizeNickname(formData.get("nickname"));
  const mbti = normalizeMbti(formData.get("mbti"));

  const judgeStyle = normalizeJudgeStyle(formData.get("judge"));
  const infoStyle  = normalizeInfoStyle(formData.get("info"));

  if (!groupName || !nickname || !mbti) {
    throw new Error("모임 이름/별명/MBTI는 필수예요.");
  }
  if (nickname.length < 1 || nickname.length > 3) {
    throw new Error("별명은 공백 없이 1~3글자만 가능해요.");
  }
  if (!/^[EI][NS][TF][JP]$/.test(mbti)) {
    throw new Error("MBTI 형식이 올바르지 않습니다. 예) ENFP");
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

          // ✅ 추가 저장 (prisma schema에 필드가 있어야 함)
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
  if (!memberId) throw new Error("멤버 생성에 실패했어요.");

  return {
    groupId: group.id,
    groupName: group.name,
    memberId,
  };
}
