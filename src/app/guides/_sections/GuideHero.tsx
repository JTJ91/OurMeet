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
    <header className="mbti-card mbti-card-frame p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-extrabold text-slate-600">
          <span className="text-base">{meta.badge}</span>
          <span>{meta.label}</span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={systemPath}
            className="mbti-back-btn px-3 py-2 text-xs font-bold whitespace-nowrap"
          >
            ← {systemLabel}
          </Link>

          <Link
            href={`/guides/${system}#${guide.slug}`}   // ✅ mbti면 /guides/mbti#friends-xxx
            className="mbti-back-btn px-3 py-2 text-xs font-bold whitespace-nowrap"
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
