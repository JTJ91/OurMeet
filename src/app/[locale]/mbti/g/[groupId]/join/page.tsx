import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/mbti/prisma";
import JoinFormClientIntl from "./JoinFormClientIntl";

type Props = {
  params: Promise<{ locale: string; groupId: string }>;
};

function localeBase(locale: string) {
  return locale === "ko" ? "" : `/${locale}`;
}

export default async function LocalizedGroupJoinPage({ params }: Props) {
  const { locale, groupId } = await params;
  const t = await getTranslations({ locale, namespace: "join.page" });

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: { members: true },
  });

  if (!group) return notFound();

  const isFull = group.members.length >= group.maxMembers;
  const base = localeBase(locale);

  return (
    <main className="mbti-page-bg pb-10">
      <div className="mbti-shell">
        <div className="mbti-card-frame mb-4 flex items-center justify-between">
          <Link href={`${base}/mbti/g/${groupId}`} className="mbti-back-btn">
            {t("back")}
          </Link>

          <div className="text-sm font-extrabold text-slate-900">{t("title")}</div>
          <div className="w-[54px]" />
        </div>

        <div className="mbti-card mbti-card-frame p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xs font-bold text-slate-500">{t("groupLabel")}</div>
              <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{group.name}</h1>
              <p className="mt-2 text-sm text-slate-600">
                {t("membersNow", { count: group.members.length })} / {t("maxMembers", { count: group.maxMembers })}
              </p>
            </div>
          </div>

          <div className="mbti-progress-track mt-4">
            <div
              className="mbti-progress-fill"
              style={{
                width: `${Math.min(100, (group.members.length / group.maxMembers) * 100)}%`,
              }}
            />
          </div>

          <JoinFormClientIntl locale={locale} groupId={groupId} isFull={isFull} />
        </div>

        <div className="mbti-card-soft mbti-card-frame mt-4 p-5">
          <p className="text-xs leading-relaxed text-slate-500">{t("disclaimer")}</p>
        </div>
      </div>
    </main>
  );
}

