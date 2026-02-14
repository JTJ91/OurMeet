// app/guides/_sections/GuideTOC.tsx
import type { GuideSection } from "../_data/mbti/types";
import { SECTION_ID, SECTION_META } from "../_data/mbti/types";
import { SECTION_LABELS, DETAIL_COPY } from "../_systems/mbti/detailI18n";
import type { GuidesLocale } from "../_systems/mbti/listI18n";

export default function GuideTOC({
  sections,
  locale = "ko",
}: {
  sections: GuideSection[];
  locale?: GuidesLocale;
}) {
  const labels = SECTION_LABELS[locale];
  const copy = DETAIL_COPY[locale];

  return (
    <section className="mbti-card-soft mbti-card-frame rounded-3xl p-4">
      <div className="text-xs font-extrabold text-slate-500">{copy.quickNav}</div>

      <div className="mt-3 flex flex-wrap gap-2">
        {sections.map((s, i) => {
          const id = SECTION_ID[s.type];
          const meta = SECTION_META[s.type];
          if (!id) return null;

          return (
            <a
              key={i}
              href={`#${id}`}
              className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200/70 bg-white/90 px-3 py-2 text-xs font-extrabold text-slate-700 shadow-[0_2px_8px_rgba(15,23,42,0.04)] hover:bg-white"
            >
              <span aria-hidden>{meta.badge}</span>
              <span className="whitespace-nowrap">{labels[s.type] ?? meta.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
