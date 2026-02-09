"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function removeAllSpaces(str: string) {
  return str.replace(/\s/g, "");
}

function normalizeMbti(mbti: string) {
  return removeAllSpaces(mbti).toUpperCase();
}

export async function createGroupAction(formData: FormData) {
  const groupNameRaw = String(formData.get("groupName") ?? "");
  const nicknameRaw = String(formData.get("nickname") ?? "");
  const mbtiRaw = String(formData.get("mbti") ?? "");

  // 🔒 모든 공백 제거
  const groupName = removeAllSpaces(groupNameRaw);
  const nickname = removeAllSpaces(nicknameRaw);
  const mbti = normalizeMbti(mbtiRaw);

  if (!groupName || !nickname || !mbti) {
    throw new Error("공백 없이 모든 값을 입력해주세요.");
  }

  // 🔒 별명 1~3글자 제한
  if (nickname.length < 1 || nickname.length > 3) {
    throw new Error("별명은 공백 없이 1~3글자만 가능해요.");
  }

  // 🔒 MBTI 형식 체크
  if (!/^[EI][NS][TF][JP]$/.test(mbti)) {
    throw new Error("MBTI 형식이 올바르지 않습니다. 예) ENFP");
  }

  const group = await prisma.group.create({
    data: {
      name: groupName,
      maxMembers: 10,
      members: {
        create: {
          nickname,
          mbti,
          isOwner: true,
        },
      },
    },
    select: { id: true },
  });

  redirect(`/g/${group.id}`);
}
