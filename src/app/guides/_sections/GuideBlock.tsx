// app/guides/_sections/GuideBlock.tsx
import type { GuideSection } from "../_data/mbti/types";
import { SECTION_ID } from "../_data/mbti/types";
import { DETAIL_COPY } from "../_systems/mbti/detailI18n";
import type { GuidesLocale } from "../_systems/mbti/listI18n";

export default function GuideBlock({
  sections,
  locale = "ko",
}: {
  sections: GuideSection[];
  locale?: GuidesLocale;
}) {
  const copy = DETAIL_COPY[locale];

  return (
    <div className="space-y-8">
      {sections.map((section, idx) => {
        const id = SECTION_ID[section.type];

        return (
          <section
            key={idx}
            id={id}
            className="mbti-card-frame scroll-mt-24 rounded-3xl border border-black/5 bg-white/80 p-6 shadow-sm"
          >
            <h2 className="text-lg font-black">{section.title}</h2>

            <div className="mt-4 space-y-4">
              {/* 타입별 분기 */}
              {section.type === "PATTERNS_TOP3" &&
                section.items.map((item, i) => (
                  <div key={i}>
                    <div className="font-extrabold">{item.title}</div>
                    <p className="mt-1 text-sm text-slate-700">{item.when}</p>
                    <p className="mt-1 text-sm text-slate-700">{item.why}</p>
                    <p className="mt-1 text-sm text-slate-700">{item.tip}</p>
                  </div>
                ))}

              {section.type === "TRIGGERS" &&
                section.items.map((item, i) => (
                  <div key={i}>
                    <div className="font-extrabold">{item.title}</div>
                    <p className="mt-1 text-sm text-slate-700">
                      {item.detail}
                    </p>
                  </div>
                ))}

              {section.type === "CAUTION" && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <div className="font-extrabold">DO</div>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {section.items.do.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-extrabold">DON'T</div>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {section.items.dont.map((d, i) => (
                        <li key={i}>• {d}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {section.type === "RULES" &&
                section.items.map((item, i) => (
                  <div key={i}>
                    <div className="font-extrabold">{item.title}</div>
                    <p className="mt-1 text-sm text-slate-700">{item.how}</p>
                    {item.example && (
                      <p className="mt-1 text-sm text-slate-500">
                        {copy.examplePrefix} {item.example}
                      </p>
                    )}
                  </div>
                ))}

              {section.type === "SCRIPTS" &&
                section.items.map((item, i) => (
                  <div key={i}>
                    <div className="font-extrabold">
                      {copy.situationPrefix} {item.situation}
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      {copy.sayPrefix} {item.say}
                    </p>
                    {item.instead && (
                      <p className="mt-1 text-sm text-red-500">
                        ❌ {item.instead}
                      </p>
                    )}
                  </div>
                ))}

              {section.type === "FAQ" &&
                section.items.map((item, i) => (
                  <div key={i}>
                    <div className="font-extrabold">
                      Q. {item.q}
                    </div>
                    <p className="mt-1 text-sm text-slate-700">
                      A. {item.a}
                    </p>
                  </div>
                ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
