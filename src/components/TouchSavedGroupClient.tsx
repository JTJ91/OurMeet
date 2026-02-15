"use client";

import { useEffect } from "react";
import { upsertSavedGroup } from "@/lib/mbti/groupHistory";

export default function TouchSavedGroupClientIntl(props: {
  groupId: string;
  groupName: string;
}) {
  useEffect(() => {
    upsertSavedGroup({ id: props.groupId, name: props.groupName });
  }, [props.groupId, props.groupName]);

  return null;
}
