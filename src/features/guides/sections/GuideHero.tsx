"use client";

import Link from "next/link";
import type { Guide } from "../data/mbti/types";
import { GROUP_META } from "../data/mbti/types";
import { GROUP_META_I18N, type GuidesLocale } from "../systems/mbti/listI18n";
import { DETAIL_COPY } from "../systems/mbti/detailI18n";

type Props = {
  guide: Guide;
  system: string; // "mbti" | "saju" ...
  locale?: GuidesLocale;
};

export default function GuideHero({ guide, system, locale = "ko" }: Props) {
  const meta = GROUP_META[guide.groupType];
  const localizedMeta = GROUP_META_I18N[locale][guide.groupType];
  const copy = DETAIL_COPY[locale];
  const base = `/${locale}`;

  const systemPath =
    system === "mbti" ? `${base}/mbti` : system === "saju" ? `${base}/saju` : `${base}/`;

  const systemLabel =
    system === "mbti" ? copy.systemLabel.mbti : system === "saju" ? copy.systemLabel.saju : copy.systemLabel.main;

  return (
    <header className="mbti-card mbti-card-frame p-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 whitespace-nowrap text-xs font-extrabold text-slate-600">
          <span className="text-base">{meta.badge}</span>
          <span>{localizedMeta.label}</span>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Link
            href={systemPath}
            className="mbti-back-btn px-3 py-2 text-xs font-bold whitespace-nowrap"
          >
            ← {systemLabel}
          </Link>

          <Link
            href={`${base}/guides/${system}#${guide.slug}`}
            className="mbti-back-btn px-3 py-2 text-xs font-bold whitespace-nowrap"
          >
            ← {copy.guideList}
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
