"use client";

import Link from "next/link";
import SaveGroupClient from "@/components/SaveGroupClient";

export default function GroupActionBarClient({
  groupId,
  groupName,
  center,
}: {
  groupId: string;
  groupName: string;
  center: {
    id: string;
    nickname: string;
    mbti: string;
  };
}) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-2">
      {/* 참여하기 */}
      <Link
        href={`/g/${groupId}/join`}
        className="
          flex h-12 items-center justify-center gap-2
          rounded-2xl bg-[#1E88E5]
          text-sm font-extrabold text-white
          hover:bg-[#1E88E5]/90
          active:scale-[0.98]
        "
      >
        🫶 참여하기
      </Link>

      {/* 저장하기 */}
      <SaveGroupClient
        groupId={groupId}
        groupName={groupName}
        myMemberId={center.id}
        myNickname={center.nickname}
        myMbti={center.mbti}
      />
    </div>
  );
}
