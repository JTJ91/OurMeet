import Link from "next/link";
import type { Guide } from "../_data/types";
import { getGuide } from "../_data/guides";

export default function RelatedGuides({ guide }: { guide: Guide }) {
  const list =
    guide.related
      ?.map((slug) => getGuide(slug))
      .filter((g): g is Guide => Boolean(g)) ?? [];

  if (list.length === 0) return null;

  return (
    <section className="rounded-3xl border border-black/5 bg-white/70 p-5 shadow-sm">
      <div className="text-xs font-extrabold tracking-wide text-slate-500">
        RELATED
      </div>
      <h3 className="mt-1 text-lg font-black">같이 보면 좋은 가이드</h3>

      <div className="mt-4 grid grid-cols-1 gap-3">
        {list.map((g) => (
          <Link
            key={g.slug}
            href={`/guides/${g.slug}`}
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
