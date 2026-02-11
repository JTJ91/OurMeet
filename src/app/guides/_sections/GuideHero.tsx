import Link from "next/link";
import type { Guide } from "../_data/types";
import { GROUP_META } from "../_data/types";

export default function GuideHero({ guide }: { guide: Guide }) {
  const meta = GROUP_META[guide.groupType];

  return (
    <header className="rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600">
          <span className="text-base">{meta.badge}</span>
          <span>{meta.label}</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-black/20"
          >
            ← 메인
          </Link>
          <Link
            href={`/guides#${guide.slug}`}
            className="rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-black/20"
            >
            ← 가이드 목록
            </Link>
        </div>
      </div>

      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
        {guide.title}
      </h1>

      <p className="mt-4 text-sm leading-7 text-slate-700">
        {guide.description}
      </p>
    </header>
  );
}
