"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

function normalizeMbti(s: string) {
  return s.trim().toUpperCase();
}

export async function joinGroupAction(formData: FormData) {
  const groupId = String(formData.get("groupId") || "").trim();
  const nickname = String(formData.get("nickname") || "").trim();
  const mbti = normalizeMbti(String(formData.get("mbti") || ""));

  if (!groupId || !nickname || !mbti) {
    throw new Error("필수값 누락");
  }

  // MBTI 간단 검증(원하면 더 엄격하게 가능)
  const ok = /^[EI][NS][TF][JP]$/.test(mbti);
  if (!ok) {
    throw new Error("MBTI 형식이 올바르지 않아요. 예) ENFP");
  }

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) throw new Error("모임이 존재하지 않아요.");

  if (group.members.length >= group.maxMembers) {
    throw new Error("이미 정원이 찼어요.");
  }

  // ✅ 생성된 멤버를 받아서 id를 확보
  const member = await prisma.member.create({
    data: {
      groupId,
      nickname,
      mbti,
    },
  });

  // ✅ 가입 직후 내가 센터로 보이게 쿼리스트링 붙여서 이동
  redirect(`/g/${groupId}?center=${member.id}`);
}
