"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import EgoGraphCanvasResponsiveIntl, { EgoNode } from "@/features/mbti/components/EgoGraphCanvasResponsive";
import { calcCompatLevel, calcCompatScore } from "@/lib/mbti/mbtiCompat";
import BottomCTA from "@/components/BottomCTA";
import membersByLocale from "./members.json";

type Member = {
  id: string;
  name: string;
  mbti: string;
};

type MemberLocale = "ko" | "en" | "ja";

function getMembers(locale: string): Member[] {
  const key: MemberLocale = locale === "en" || locale === "ja" ? locale : "ko";
  return membersByLocale[key] as Member[];
}

type Props = {
  locale: string;
};

type QuickMenuTab = "tests" | "guides";

export default function MbtiPageIntlClient({ locale }: Props) {
  const t = useTranslations("mbti.page");
  const members = useMemo(() => getMembers(locale), [locale]);
  const base = locale === "ko" ? "" : `/${locale}`;
  const testsSectionRef = useRef<HTMLElement | null>(null);

  const initialCenterId = members[0].id;
  const [centerId, setCenterId] = useState<string>(initialCenterId);
  const [activeQuickTab, setActiveQuickTab] = useState<QuickMenuTab>("tests");

  const membersById = useMemo(() => {
    const m = new Map<string, (typeof members)[number]>();
    for (const item of members) m.set(item.id, item);
    return m;
  }, [members]);

  const center = useMemo(() => membersById.get(centerId) ?? members[0], [centerId, membersById, members]);

  const handleCenterChange = useCallback((id: string) => {
    setCenterId(id);
  }, []);

  const jumpToTests = useCallback(() => {
    setActiveQuickTab("tests");
    testsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const otherNodes: EgoNode[] = useMemo(() => {
    const cMbti = center.mbti;

    return members
      .filter((m) => m.id !== centerId)
      .map((m) => {
        const score = calcCompatScore(cMbti, m.mbti);
        const level = calcCompatLevel(cMbti, m.mbti) as 1 | 2 | 3 | 4 | 5;

        return { id: m.id, name: m.name, mbti: m.mbti, score, level };
      });
  }, [members, centerId, center.mbti]);

  return (
    <main className="mbti-page-bg pb-10">
      <div className="mbti-shell flex min-h-screen flex-col">
        <div className="mbti-card-frame flex items-center justify-between">
          <Link href={`${base}/`} className="mbti-back-btn">
            <span aria-hidden>←</span>
            <span>{t("backHome")}</span>
          </Link>
        </div>

        <section className="mt-4">
          <div className="mbti-card mbti-card-frame p-6">
            <h1 className="text-3xl font-extrabold leading-tight">
              {t("titleLine1")}
              <br />
              <span className="underline decoration-[#FDD835]/70">{t("titleLine2")}</span>
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              <b className="text-[#1E88E5]">{t("descriptionLead")}</b>
              {t("descriptionLeadSuffix")}
              <br />
              {t("descriptionPrefix")} <b className="text-slate-800">{t("descriptionEmphasis")}</b>
              {t("descriptionSuffix")}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold">
              <Link
                href={`${base}/mbti/cognitive-functions`}
                className="text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700"
              >
                {t("cognitiveGuide")}
              </Link>
              <button
                type="button"
                onClick={jumpToTests}
                className="text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700"
              >
                {t("tryTest")}
              </button>
            </div>
          </div>
        </section>

        <section className="mt-10">
          <div className="mbti-card mbti-card-frame overflow-hidden">
            <EgoGraphCanvasResponsiveIntl
              centerName={center.name}
              centerSub={center.mbti}
              nodes={otherNodes}
              ringCount={3}
              maxSize={760}
              minSize={300}
              aspect={1}
              onCenterChange={handleCenterChange}
            />
          </div>
        </section>

        <section ref={testsSectionRef} id="mbti-tests" className="mt-5 scroll-mt-24">
          <div className="mbti-card mbti-card-frame p-4">
            <div className="mb-3 grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveQuickTab("tests")}
                className={[
                  "rounded-xl px-3 py-2 text-sm font-extrabold transition",
                  activeQuickTab === "tests" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                {t("tabTests")}
              </button>
              <button
                type="button"
                onClick={() => setActiveQuickTab("guides")}
                className={[
                  "rounded-xl px-3 py-2 text-sm font-extrabold transition",
                  activeQuickTab === "guides" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700",
                ].join(" ")}
              >
                {t("tabGuides")}
              </button>
            </div>

            {activeQuickTab === "tests" ? (
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href={`${base}/mbti-test/quick`}
                  className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-start gap-x-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]"
                >
                  <span className="leading-snug">{t("testQuickLabel")}</span>
                  <span className="min-w-0 text-right text-[11px] font-semibold leading-snug text-slate-500 break-words">
                    {t("testQuickDesc")}
                  </span>
                </Link>

                <Link
                  href={`${base}/mbti-test`}
                  className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-start gap-x-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]"
                >
                  <span className="leading-snug">{t("testFullLabel")}</span>
                  <span className="min-w-0 text-right text-[11px] font-semibold leading-snug text-slate-500 break-words">
                    {t("testFullDesc")}
                  </span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2">
                <Link
                  href={`${base}/guides/mbti`}
                  className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-start gap-x-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]"
                >
                  <span className="leading-snug">{t("guidesLabel")}</span>
                  <span className="min-w-0 text-right text-[11px] font-semibold leading-snug text-slate-500 break-words">
                    {t("guidesDesc")}
                  </span>
                </Link>

                <Link
                  href={`${base}/mbti/cognitive-functions`}
                  className="grid grid-cols-[minmax(0,7.5rem)_minmax(0,1fr)] items-start gap-x-3 rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white sm:grid-cols-[minmax(0,9rem)_minmax(0,1fr)]"
                >
                  <span className="leading-snug">{t("usageLabel")}</span>
                  <span className="min-w-0 text-right text-[11px] font-semibold leading-snug text-slate-500 break-words">
                    {t("usageDesc")}
                  </span>
                </Link>
              </div>
            )}
          </div>
        </section>
      </div>

      <BottomCTA desktopSticky />
    </main>
  );
}
