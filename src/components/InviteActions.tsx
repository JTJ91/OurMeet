"use client";

import { useMemo, useState } from "react";
import { Share } from "lucide-react";

export default function InviteActions({ groupId }: { groupId: string }) {
  const [copied, setCopied] = useState(false);

  const fullUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    const ver = process.env.NEXT_PUBLIC_SHARE_VER ?? "1";

    const u = new URL(`/g/${groupId}`, window.location.origin);
    u.searchParams.set("v", ver);
    return u.toString();
  }, [groupId]);

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "모임 초대",
          text: "이 링크로 모임에 참여해요",
          url: fullUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // fallback
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={share}
        className="
            absolute right-0 top-0
            flex items-center gap-1.5
            rounded-full bg-white/90 px-2.5 py-1.5
            text-xs font-semibold text-[#1E88E5]
            ring-1 ring-[#1E88E5]/20
            backdrop-blur-sm
            transition-all duration-200
            hover:bg-[#1E88E5]/10 active:scale-95
        "
        >
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
        >
            <path d="M12 3v12" />
            <path d="M8 7l4-4 4 4" />
            <path d="M4 14v4a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4" />
        </svg>

        <span className="whitespace-nowrap">공유하기</span>
        </button>



      {copied && (
        <div className="absolute right-0 top-12 rounded-full bg-slate-900/90 px-3 py-1 text-xs font-bold text-white shadow-sm">
          링크 복사됨
        </div>
      )}
    </>
  );
}
