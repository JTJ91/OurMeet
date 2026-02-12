"use client";

import Link from "next/link";
import SaveGroupClient from "@/app/components/SaveGroupClient";
import { HeartHandshake } from "lucide-react";

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
            flex h-10 w-full items-center justify-center gap-1.5
            rounded-2xl bg-[#1E88E5]
            text-sm font-extrabold text-white
            border border-transparent
            hover:bg-[#1E88E5]/90
            active:scale-[0.98]
            leading-none
        "
        >
        <HeartHandshake className="h-4 w-4 shrink-0" />
        <span className="leading-none">참여하기</span>
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
