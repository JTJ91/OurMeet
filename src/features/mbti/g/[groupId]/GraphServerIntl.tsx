import { prisma } from "@/lib/mbti/prisma";
import GraphClientIntl from "./GraphClientIntl";
import { getCompatScore } from "@/lib/mbti/mbtiCompat";
import { getTranslations } from "next-intl/server";
import { normalizeMemberPrefs } from "@/lib/mbti/memberPrefs";

type GraphLocale = "ko" | "en" | "ja";

function normalizeLocale(locale?: string): GraphLocale {
  if (locale === "en" || locale === "ja") return locale;
  return "ko";
}

function GraphSectionCard({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="mbti-card-frame overflow-hidden rounded-3xl border border-slate-200/70 bg-white/85 shadow-[0_10px_28px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <div className="border-b border-slate-200/60 bg-[#1E88E5]/[0.05] px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#1E88E5]/10 px-2.5 py-1 text-[11px] font-extrabold text-[#1E88E5]">
                  <span aria-hidden className="mr-1">🧭</span>
                  {title}
                </span>
                {subtitle ? <span className="text-[11px] font-bold text-slate-500">{subtitle}</span> : null}
              </div>
            </div>

            {right ? <div className="shrink-0">{right}</div> : null}
          </div>
        </div>

        <div>{children}</div>
      </div>
    </section>
  );
}

export default async function GraphServerIntl({
  locale,
  groupId,
  centerId,
}: {
  locale?: string;
  groupId: string;
  centerId?: string;
}) {
  const activeLocale = normalizeLocale(locale);
  const t = await getTranslations({ locale: activeLocale, namespace: "groupGraph.server" });

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) return null;

  const members = group.members.map((m) => ({
    id: m.id,
    nickname: m.nickname,
    mbti: (m.mbti || "").toUpperCase(),
    prefs: normalizeMemberPrefs({
      ideaStrength: m.ideaStrength,
      factStrength: m.factStrength,
      logicStrength: m.logicStrength,
      peopleStrength: m.peopleStrength,
      conflictStyle: m.conflictStyle,
      energy: m.energy,
    }),
  }));

  if (members.length === 0) {
    return (
      <section className="mbti-card-frame mt-4 rounded-3xl border border-slate-200/70 bg-white/85 p-5 shadow-[0_10px_24px_rgba(15,23,42,0.06)] backdrop-blur-sm">
        <p className="text-sm text-slate-500">{t("emptyMembers")}</p>
      </section>
    );
  }

  const center = (centerId ? members.find((m) => m.id === centerId) : null) ?? members[0];

  const nodes = members
    .filter((m) => m.id !== center.id)
    .map((m) => {
      const compat = getCompatScore(center.id, center.mbti, m.id, m.mbti, center.prefs, m.prefs);

      return {
        id: m.id,
        name: m.nickname,
        mbti: m.mbti.toUpperCase(),
        score: compat.score,
        level: compat.level,
      };
    });

  const pairScores: number[] = [];
  for (let i = 0; i < members.length; i++) {
    for (let j = i + 1; j < members.length; j++) {
      const a = members[i];
      const b = members[j];
      const compat = getCompatScore(a.id, a.mbti, b.id, b.mbti, a.prefs, b.prefs);
      if (Number.isFinite(compat.score)) pairScores.push(compat.score);
    }
  }

  const pairAverageScore =
    pairScores.length > 0 ? pairScores.reduce((sum, score) => sum + score, 0) / pairScores.length : null;

  return (
    <GraphSectionCard title={t("title")} subtitle={t("subtitle")}>
      <GraphClientIntl
        locale={activeLocale}
        groupId={group.id}
        groupName={group.name}
        center={center}
        nodes={nodes}
        memberCount={members.length}
        pairAverageScore={pairAverageScore}
      />
    </GraphSectionCard>
  );
}
