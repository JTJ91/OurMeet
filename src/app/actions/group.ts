"use server";

import { prisma } from "@/lib/prisma";

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

  const groupName = removeAllSpaces(groupNameRaw);
  const nickname = removeAllSpaces(nicknameRaw);
  const mbti = normalizeMbti(mbtiRaw);

  if (!groupName || !nickname || !mbti) {
    throw new Error("공백 없이 모든 값을 입력해주세요.");
  }
  if (nickname.length < 1 || nickname.length > 3) {
    throw new Error("별명은 공백 없이 1~3글자만 가능해요.");
  }
  if (!/^[EI][NS][TF][JP]$/.test(mbti)) {
    throw new Error("MBTI 형식이 올바르지 않습니다. 예) ENFP");
  }

  // ✅ group + owner member id를 같이 받기
  const group = await prisma.group.create({
    data: {
      name: groupName,
      maxMembers: 20,
      members: {
        create: {
          nickname,
          mbti,
          isOwner: true,
        },
      },
    },
    select: {
      id: true,
      name: true,
      members: { select: { id: true }, take: 1 }, // 방금 만든 owner 1명
    },
  });

  const memberId = group.members[0]?.id;
  if (!memberId) throw new Error("멤버 생성에 실패했어요.");

  // ✅ redirect 대신 return
  return {
    groupId: group.id,
    groupName: group.name,
    memberId,
  };
}
