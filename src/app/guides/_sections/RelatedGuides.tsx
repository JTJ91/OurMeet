import Link from "next/link";
import type { Guide } from "../_data/mbti/types";
import { getGuide } from "../_data/mbti/guides";
import { DETAIL_COPY } from "../_systems/mbti/detailI18n";
import type { GuidesLocale } from "../_systems/mbti/listI18n";

type Props = {
  guide: Guide;
  system: string; // "mbti" | "saju" ...
  locale?: GuidesLocale;
  relatedGuides?: Guide[];
};

export default function RelatedGuides({ guide, system, locale = "ko", relatedGuides }: Props) {
  const base = locale === "ko" ? "" : `/${locale}`;
  const copy = DETAIL_COPY[locale];
  const list = relatedGuides ?? guide.related?.map((slug) => getGuide(slug)).filter((g): g is Guide => Boolean(g)) ?? [];

  if (list.length === 0) return null;

  return (
    <section className="mbti-card-frame rounded-3xl border border-black/5 bg-white/70 p-5 shadow-sm">
      <div className="text-xs font-extrabold tracking-wide text-slate-500">
        {copy.relatedKicker}
      </div>
      <h3 className="mt-1 text-lg font-black">{copy.relatedTitle}</h3>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {list.map((g) => (
          <Link
            key={g.slug}
            href={`${base}/guides/${system}/${g.slug}`}
            className="rounded-2xl border border-black/5 bg-white/80 p-4 shadow-sm transition hover:bg-white"
          >
            <div className="text-sm font-black">{g.title}</div>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {g.description}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
