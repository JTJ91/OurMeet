"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function normalizeMbti(mbti: string) {
  return mbti.trim().toUpperCase();
}

export async function createGroupAction(formData: FormData) {
  const groupName = String(formData.get("groupName") ?? "").trim();
  const nickname = String(formData.get("nickname") ?? "").trim();
  const mbti = normalizeMbti(String(formData.get("mbti") ?? ""));

  if (!groupName || !nickname || !mbti) {
    throw new Error("필수 입력값이 비었습니다.");
  }
  if (!/^[EI][NS][TF][JP]$/.test(mbti)) {
    throw new Error("MBTI 형식이 올바르지 않습니다. 예) ENFP");
  }

  const group = await prisma.group.create({
    data: {
      name: groupName,
      maxMembers: 10, // 기본 10명
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
