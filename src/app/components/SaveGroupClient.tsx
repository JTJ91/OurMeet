"use client";

import { useState } from "react";
import { upsertSavedGroup } from "@/app/lib/mbti/groupHistory";

export default function SaveGroupClient(props: {
  groupId: string;
  groupName: string;

  myMemberId?: string | null;
  myNickname?: string | null;
  myMbti?: string | null;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <button
      type="button"
      onClick={() => {
        upsertSavedGroup({
          id: props.groupId,
          name: props.groupName,
          myMemberId: props.myMemberId ?? undefined,
          myNickname: props.myNickname ?? undefined,
          myMbti: props.myMbti?.toUpperCase() ?? undefined,
        });

        setSaved(true);
        setTimeout(() => setSaved(false), 1200);
      }}
      className="
        flex h-10 w-full items-center justify-center gap-1.5
        rounded-2xl bg-white
        text-sm font-extrabold text-slate-800
        border border-black/10
        transition-all duration-200
        hover:bg-slate-50
        active:scale-[0.98]
        leading-none
        "
    >
      {saved ? "저장됨 ✓" : "저장하기"}
    </button>
  );
}
