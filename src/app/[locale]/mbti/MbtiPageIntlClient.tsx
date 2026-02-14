"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import EgoGraphCanvasResponsiveIntl, { EgoNode } from "@/app/[locale]/components/mbti/EgoGraphCanvasResponsive";
import { calcCompatLevel, calcCompatScore } from "@/app/lib/mbti/mbtiCompat";
import BottomCTA from "@/app/[locale]/components/BottomCTA";
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

export default function MbtiPageIntlClient({ locale }: Props) {
  const t = useTranslations("mbti.page");
  const members = useMemo(() => getMembers(locale), [locale]);
  const base = locale === "ko" ? "" : `/${locale}`;

  const initialCenterId = members[0].id;
  const [centerId, setCenterId] = useState<string>(initialCenterId);

  const membersById = useMemo(() => {
    const m = new Map<string, (typeof members)[number]>();
    for (const item of members) m.set(item.id, item);
    return m;
  }, [members]);

  const center = useMemo(() => membersById.get(centerId) ?? members[0], [centerId, membersById, members]);

  const handleCenterChange = useCallback((id: string) => {
    setCenterId(id);
  }, []);

  const compatCache = useMemo(() => new Map<string, { score: number; level: 1 | 2 | 3 | 4 | 5 }>(), []);

  const otherNodes: EgoNode[] = useMemo(() => {
    const cMbti = center.mbti;

    return members
      .filter((m) => m.id !== centerId)
      .map((m) => {
        const key = `${cMbti}__${m.mbti}`;
        const cached = compatCache.get(key);
        if (cached) {
          return { id: m.id, name: m.name, mbti: m.mbti, score: cached.score, level: cached.level };
        }

        const score = calcCompatScore(cMbti, m.mbti);
        const level = calcCompatLevel(cMbti, m.mbti) as 1 | 2 | 3 | 4 | 5;
        compatCache.set(key, { score, level });

        return { id: m.id, name: m.name, mbti: m.mbti, score, level };
      });
  }, [members, centerId, center.mbti, compatCache]);

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

            <Link
              href={`${base}/mbti/cognitive-functions`}
              className="mt-3 inline-block text-xs font-bold text-slate-500 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-700"
            >
              {t("cognitiveGuide")}
            </Link>
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

        <section className="mt-5">
          <div className="mbti-card mbti-card-frame p-4">
            <div className="mb-3 text-xs font-extrabold text-slate-500">{t("quickStart")}</div>
            <div className="grid grid-cols-1 gap-2">
              <Link
                href={`${base}/mbti-test`}
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white"
              >
                <span>{t("testLabel")}</span>
                <span className="text-[11px] font-semibold text-slate-500">{t("testDesc")}</span>
              </Link>

              <Link
                href={`${base}/guides/mbti`}
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white"
              >
                <span>{t("guidesLabel")}</span>
                <span className="text-[11px] font-semibold text-slate-500">{t("guidesDesc")}</span>
              </Link>

              <Link
                href={`${base}/mbti/cognitive-functions`}
                className="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm font-extrabold text-slate-800 transition hover:bg-white"
              >
                <span>{t("usageLabel")}</span>
                <span className="text-[11px] font-semibold text-slate-500">{t("usageDesc")}</span>
              </Link>
            </div>
          </div>
        </section>
      </div>

      <BottomCTA desktopSticky />
    </main>
  );
}
