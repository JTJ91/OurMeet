// components/RememberGroupClient.tsx
"use client";

import { useEffect } from "react";
import { upsertSavedGroup } from "@/lib/groupHistory";

export default function RememberGroupClient({
  groupId,
  groupName,
  myMemberId,
  myNickname,
  myMbti,
}: {
  groupId: string;
  groupName: string;
  myMemberId?: string;
  myNickname?: string;
  myMbti?: string;
}) {
  useEffect(() => {
    upsertSavedGroup({
      id: groupId,
      name: groupName,
      myMemberId,
      myNickname,
      myMbti,
    });
  }, [groupId, groupName, myMemberId, myNickname, myMbti]);

  return null;
}
