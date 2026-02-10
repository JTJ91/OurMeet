"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

function normalizeMbti(s: string) {
  return s.replace(/\s/g, "").toUpperCase();
}

function normalizeJudge(v: unknown) {
  const s = String(v ?? "").toUpperCase();
  return s === "PEOPLE" ? "PEOPLE" : "LOGIC"; // default LOGIC
}

function normalizeInfo(v: unknown) {
  const s = String(v ?? "").toUpperCase();
  return s === "FACT" ? "FACT" : "IDEA"; // default IDEA
}

export async function joinGroupAction(formData: FormData) {
  const groupId = String(formData.get("groupId") || "").trim();
  const nickname = String(formData.get("nickname") || "").replace(/\s/g, "");
  const mbti = normalizeMbti(String(formData.get("mbti") || ""));

  // ✅ 추가 입력 2개
  const judge = normalizeJudge(formData.get("judge"));
  const info = normalizeInfo(formData.get("info"));

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
    data: {
      groupId,
      nickname,
      mbti,
      judgeStyle: judge, // ✅ 새 컬럼
      infoStyle: info,   // ✅ 새 컬럼
    },
    select: { id: true },
  });

  revalidatePath(`/g/${groupId}`);

  return {
    groupId: group.id,
    groupName: group.name,
    memberId: member.id,
  };
}
