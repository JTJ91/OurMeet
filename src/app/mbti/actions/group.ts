"use server";

import { prisma } from "@/app/lib/mbti/prisma";
import { revalidatePath } from "next/cache"; // ✅ 추가
import { isNicknameLengthValid, sanitizeNicknameInput } from "@/app/mbti/lib/nickname";

type JudgeStyle = "LOGIC" | "PEOPLE";
type InfoStyle = "IDEA" | "FACT";

function normalizeGroupName(name: FormDataEntryValue | null) {
  return String(name ?? "").trim();
}

function normalizeNickname(nick: FormDataEntryValue | null) {
  return sanitizeNicknameInput(String(nick ?? ""));
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
  if (!isNicknameLengthValid(nickname)) {
    throw new Error("별명은 공백 없이 한글/일본어 3자, 영어 6자까지 가능해요.");
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

  // ✅ 새 방 생성 후: 목록/해당 방 페이지 캐시 무효화
  revalidatePath("/mbti");                 // 홈/랭킹/최근 모임 등
  revalidatePath(`/mbti/g/${group.id}`);   // 방 상세(바로 들어갈 거라면)

  return {
    groupId: group.id,
    groupName: group.name,
    memberId,
  };
}
