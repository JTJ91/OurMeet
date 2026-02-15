import Link from "next/link";

import { listGuidesByGroupIntl } from "../../data/mbti/guides-intl";
import { GROUP_META, type GroupType } from "../../data/mbti/types";
import { GROUP_META_I18N, PAGE_COPY, type GuidesLocale } from "./listI18n";

const ORDER: GroupType[] = ["FRIENDS", "WORK", "LOCAL", "SPORTS", "GAMES"];

type Props = {
  locale?: GuidesLocale;
};

export default function MbtiGuidesPage({ locale = "ko" }: Props) {
  const system = "mbti";
  const copy = PAGE_COPY[locale];
  const base = locale === "ko" ? "" : `/${locale}`;
  const groupMeta = GROUP_META_I18N[locale];
  const formatCount = (count: number) => (locale === "en" ? `${count} ${copy.countSuffix}` : `${count}${copy.countSuffix}`);

  return (
    <main className="mbti-page-bg">
      <div className="mbti-shell pb-16">
        <div id="top" />

        {/* 뒤로가기 */}
        <div className="mbti-card-frame mb-4">
          <Link
            href={`${base}/mbti`}
            className="mbti-back-btn"
          >
            ← {copy.back}
          </Link>
        </div>

        {/* 헤더 */}
        <header className="mbti-card mbti-card-frame p-6">
          <h1 className="mt-2 text-2xl font-black leading-tight">
            {copy.heroLine1}
            <br />
            {copy.heroLine2}
          </h1>
          <p className="mt-3 text-sm leading-7 text-slate-700">
            {copy.heroDesc}
          </p>
        </header>

        {/* 상단 카테고리 */}
        <section className="mt-6">
          <div className="grid grid-cols-1 gap-3">
            {ORDER.map((k) => {
              const m = GROUP_META[k];
              const lm = groupMeta[k];
              return (
                <a
                  key={k}
                  href={`#${m.anchor}`}
                  className="mbti-card mbti-card-frame group rounded-3xl p-5 transition hover:bg-white"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{m.badge}</span>
                        <div className="text-base font-black">{lm.label}</div>
                      </div>
                      <div className="mt-1 text-sm text-slate-600">{lm.desc}</div>
                    </div>
                    <div className="mbti-back-btn shrink-0 px-3 py-1 text-xs font-extrabold">
                      {copy.jump} →
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </section>

        {/* 가이드 목록 */}
        <section className="mt-8 space-y-10">
          {ORDER.map((k) => {
            const m = GROUP_META[k];
            const lm = groupMeta[k];
            const list = listGuidesByGroupIntl(k, locale);
            if (list.length === 0) return null;

            return (
              <section key={k} id={m.anchor} className="scroll-mt-24">
                <div className="mbti-card-frame mt-10">
                  <div className="mb-5 h-[2px] w-full bg-black/5" />
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.badge}</span>
                        <h2 className="text-2xl font-black tracking-tight">{lm.label}</h2>
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-extrabold text-slate-600">
                          {formatCount(list.length)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm text-slate-600">{lm.desc}</p>
                    </div>

                    <a
                      href="#top"
                      className="mbti-back-btn"
                    >
                      {copy.top}
                    </a>
                  </div>
                </div>

                <div className="mt-4 grid gap-3">
                  {list.map((g) => {
                    return (
                      <Link
                        key={g.slug}
                        id={g.slug}
                        href={`${base}/guides/${system}/${g.slug}`}
                        className="mbti-card mbti-card-frame scroll-mt-24 rounded-3xl p-5 transition hover:bg-white"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-lg font-black">{g.title}</div>
                            <p className="mt-2 text-sm text-slate-700">{g.description}</p>
                          </div>

                          <div className="mbti-back-btn shrink-0 self-start px-3 py-1 text-xs font-extrabold">
                            {copy.read} →
                          </div>
                        </div>
                      </Link>
                    );
                  })}


                </div>
              </section>
            );
          })}
        </section>
      </div>
    </main>
  );
}
