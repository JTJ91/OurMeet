"use server";

import { prisma } from "@/lib/prisma";

function normalizeMbti(s: string) {
  return s.replace(/\s/g, "").toUpperCase();
}

export async function joinGroupAction(formData: FormData) {
  const groupId = String(formData.get("groupId") || "").trim();
  const nickname = String(formData.get("nickname") || "").replace(/\s/g, "");
  const mbti = normalizeMbti(String(formData.get("mbti") || ""));

  if (!groupId || !nickname || !mbti) {
    throw new Error("필수값 누락");
  }

  const ok = /^[EI][NS][TF][JP]$/.test(mbti);
  if (!ok) throw new Error("MBTI 형식이 올바르지 않아요. 예) ENFP");

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });
  if (!group) throw new Error("모임이 존재하지 않아요.");

  if (group.members.length >= group.maxMembers) {
    throw new Error("이미 정원이 찼어요.");
  }

  const member = await prisma.member.create({
    data: { groupId, nickname, mbti },
    select: { id: true },
  });

  // ✅ redirect 대신 return
  return {
    groupId: group.id,
    groupName: group.name,
    memberId: member.id,
  };
}
