"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Guide } from "../_data/mbti/types";
import { GROUP_META } from "../_data/mbti/types";

type Props = {
  guide: Guide;
  system: string; // "mbti" | "saju" ...
};

export default function GuideHero({ guide, system }: Props) {
  const router = useRouter();
  const meta = GROUP_META[guide.groupType];

  const systemPath =
    system === "mbti" ? "/mbti" : system === "saju" ? "/saju" : "/";

  const systemLabel =
    system === "mbti" ? "MBTI 홈" : system === "saju" ? "사주 홈" : "메인";

  return (
    <header className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600">
          <span className="text-base">{meta.badge}</span>
          <span>{meta.label}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={systemPath}
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-black/20"
          >
            ← {systemLabel}
          </Link>

          <Link
            href={`/guides/${system}#${guide.slug}`}   // ✅ mbti면 /guides/mbti#friends-xxx
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-black/20"
          >
            ← 가이드 목록
          </Link>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {guide.title}
      </h1>

      <p className="mt-4 text-sm leading-7 text-slate-700">{guide.description}</p>
    </header>
  );
}
