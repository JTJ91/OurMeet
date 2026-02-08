"use client";

import { useEffect } from "react";
import { upsertSavedGroup } from "@/lib/groupHistory";

export default function RememberGroupClient({
  groupId,
  groupName,
}: {
  groupId: string;
  groupName: string;
}) {
  useEffect(() => {
    upsertSavedGroup({ id: groupId, name: groupName });
  }, [groupId, groupName]);

  return null;
}
