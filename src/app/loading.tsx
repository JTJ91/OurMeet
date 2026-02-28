// app/loading.tsx
"use client";

import { usePathname } from "next/navigation";

function loadingLabel(pathname: string) {
  const locale = pathname.match(/^\/(ko|en|ja)(?=\/|$)/)?.[1] ?? "ko";
  if (locale === "en") return "Loading...";
  if (locale === "ja") return "読み込み中...";
  return "로딩 중...";
}

export default function Loading() {
  const pathname = usePathname() || "/";

  return (
    <main className="min-h-screen bg-[#F5F9FF] grid place-items-center">
      <div className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 ring-1 ring-black/5 backdrop-blur">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
        <span className="text-sm font-semibold text-slate-600">{loadingLabel(pathname)}</span>
      </div>
    </main>
  );
}
