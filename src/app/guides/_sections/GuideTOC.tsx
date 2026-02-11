// app/guides/_sections/GuideTOC.tsx
import type { GuideSection } from "../_data/types";
import { SECTION_ID, SECTION_META } from "../_data/types";

export default function GuideTOC({ sections }: { sections: GuideSection[] }) {
  return (
    <section className="rounded-3xl border border-black/5 bg-white/70 p-4 shadow-sm">
      <div className="text-xs font-extrabold text-slate-500">바로가기</div>

      <div className="mt-3 flex flex-wrap gap-2">
        {sections.map((s, i) => {
          const id = SECTION_ID[s.type];
          const meta = SECTION_META[s.type];
          if (!id) return null;

          return (
            <a
              key={i}
              href={`#${id}`}
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 hover:border-black/20"
            >
              <span aria-hidden>{meta.badge}</span>
              <span>{meta.label}</span>
            </a>
          );
        })}
      </div>
    </section>
  );
}
